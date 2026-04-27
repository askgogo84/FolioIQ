import { NextRequest, NextResponse } from "next/server";

async function parseExcel(buffer: Buffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
  return rows.map(r => ({
    name: String(r["Fund Name"] || r["Scheme Name"] || r["Fund"] || "").trim(),
    units: parseFloat(String(r["Units"] || r["Quantity"] || "0")),
    avgNav: parseFloat(String(r["Avg NAV"] || r["Average NAV"] || "0")),
    currentValue: parseFloat(String(r["Current Value"] || "0")),
    investedAmount: parseFloat(String(r["Invested Amount"] || r["Cost Value"] || "0")),
    purchaseDate: String(r["Purchase Date"] || r["Date"] || "").trim(),
    sipAmount: parseFloat(String(r["SIP Amount"] || "0")),
  })).filter(h => h.name && h.name.length > 3);
}

async function parseWithVision(base64: string, mediaType: string) {
  const isPDF = mediaType === "application/pdf";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 2000,
      system: "Extract Indian mutual fund holdings from Kuvera, Groww, Zerodha, ET Money, CAMS CAS PDFs, screenshots. Return ONLY a JSON array.",
      messages: [{ role: "user", content: [
        { type: isPDF ? "document" : "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: "Extract all mutual fund holdings. Return JSON array: [{\"name\":\"fund name\",\"units\":100,\"avgNav\":50.0,\"currentValue\":5000,\"investedAmount\":4500,\"sipAmount\":0,\"purchaseDate\":\"2022-06-15\"}]. Use null for missing. Return ONLY the array." }
      ]}]
    })
  });
  const d = await res.json();
  const text = d.content?.[0]?.text || "[]";
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim()); }
  catch { const m = text.match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : []; }
}

async function matchToAMFI(name: string) {
  if (!name || name.length < 3) return null;
  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(name.substring(0, 35))}`, { signal: AbortSignal.timeout(5000) });
    const results = await res.json();
    if (!results?.length) return null;
    const match = results.find((r: { schemeName: string }) => r.schemeName.toLowerCase().includes("direct") && r.schemeName.toLowerCase().includes("growth")) || results[0];
    const detail = await (await fetch(`https://api.mfapi.in/mf/${match.schemeCode}`, { signal: AbortSignal.timeout(5000) })).json();
    return { schemeCode: String(match.schemeCode), schemeName: match.schemeName, category: detail?.meta?.scheme_category || "Equity Scheme", amc: detail?.meta?.fund_house || "" };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let raw: { name: string; units: number | null; avgNav: number | null; currentValue: number | null; investedAmount: number | null; purchaseDate: string | null; sipAmount: number | null }[] = [];
    let parseMethod = "";
    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) { raw = await parseExcel(buffer); parseMethod = "excel"; }
    else if (filename.endsWith(".csv")) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buffer.toString("utf-8"), { type: "string" });
      raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }).map((r: Record<string, unknown>) => ({ name: String(r["Fund Name"] || r["Scheme Name"] || "").trim(), units: parseFloat(String(r["Units"] || "0")), avgNav: parseFloat(String(r["Avg NAV"] || "0")), currentValue: 0, investedAmount: parseFloat(String(r["Invested Amount"] || "0")), purchaseDate: String(r["Purchase Date"] || "").trim(), sipAmount: parseFloat(String(r["SIP Amount"] || "0")) })).filter((h: { name: string }) => h.name.length > 3);
      parseMethod = "csv";
    }
    else if (filename.endsWith(".pdf")) { raw = await parseWithVision(buffer.toString("base64"), "application/pdf"); parseMethod = "vision-pdf"; }
    else if (filename.match(/\.(jpg|jpeg|png|webp)$/)) { const mt: Record<string,string> = { jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp" }; raw = await parseWithVision(buffer.toString("base64"), mt[filename.split(".").pop()!] || "image/jpeg"); parseMethod = "vision-image"; }
    else return NextResponse.json({ error: "Upload .xlsx .csv .pdf .jpg .png or .webp" }, { status: 400 });
    if (!raw.length) return NextResponse.json({ error: "No mutual fund holdings found", parseMethod }, { status: 422 });
    const matched = [], unmatched: string[] = [];
    for (let i = 0; i < raw.length; i += 4) {
      const results = await Promise.allSettled(raw.slice(i, i + 4).map(async h => {
        if (!h.name) return null;
        const amfi = await matchToAMFI(h.name);
        if (!amfi) { unmatched.push(h.name); return null; }
        let units = h.units || 0, avgNav = h.avgNav || 0;
        if (!units && h.investedAmount && avgNav) units = h.investedAmount / avgNav;
        if (!avgNav && h.investedAmount && units) avgNav = h.investedAmount / units;
        if (!units) units = 100;
        let pd = h.purchaseDate || "";
        if (!pd.match(/^\d{4}-\d{2}-\d{2}$/)) { const d = new Date(); d.setFullYear(d.getFullYear() - 2); pd = d.toISOString().split("T")[0]; }
        return { ...amfi, units, avgNav, purchaseDate: pd, sipAmount: h.sipAmount || 0, matchConfidence: units > 0 && avgNav > 0 ? "high" : "low", originalName: h.name };
      }));
      for (const r of results) if (r.status === "fulfilled" && r.value) matched.push(r.value);
    }
    return NextResponse.json({ success: true, parseMethod, totalExtracted: raw.length, totalMatched: matched.length, unmatched, holdings: matched });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Failed to process file" }, { status: 500 }); }
}
