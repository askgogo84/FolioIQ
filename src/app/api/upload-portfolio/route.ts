// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";

async function parseNJWealthXLS(buffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sh = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: "" });
  const funds = [];
  let currentFund = null;
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].map((c) => String(c).trim());
    if (r.some((c) => c.includes("Sr. No.") || c.includes("ISIN"))) { headerRow = i; break; }
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].map((c) => String(c).trim());
    const col0 = r[0];
    const skip = ["Sr","Sub","Grand","Note","Return","Total","Address","City","Phone","Mobile","E-Mail","Pincode","Name","Off","Your","Scheme Wise","Goverdhan"];
    const isFund = col0 && col0.length > 5 && !/^\d/.test(col0) && !skip.some((x) => col0.startsWith(x)) && r.slice(1,5).every((c) => !c);
    if (isFund) { currentFund = col0; continue; }
    if (col0 === "Sub Total" && currentFund) {
      const invested = parseFloat(r[5]) || 0;
      const units = parseFloat(r[8]) || 0;
      const currentValue = parseFloat(r[10] || r[9]) || 0;
      let curNAV = 0;
      for (let back = i-1; back >= Math.max(i-15,0); back--) {
        const br = rows[back].map((c) => String(c).trim());
        if (/^\d+$/.test(br[0]) && br[9] && parseFloat(br[9]) > 0) { curNAV = parseFloat(br[9]); break; }
      }
      let purchaseDate = "";
      for (let fwd = headerRow+1; fwd < i; fwd++) {
        const fr = rows[fwd].map((c) => String(c).trim());
        if (/^\d+$/.test(fr[0]) && fr[4]) {
          const p = fr[4].split("-");
          if (p.length === 3) purchaseDate = p[2]+"-"+p[1].padStart(2,"0")+"-"+p[0].padStart(2,"0");
          break;
        }
      }
      if (invested > 100) {
        funds.push({ name: currentFund.trim(), units, avgNav: units>0?invested/units:0, currentValue: currentValue||units*curNAV, investedAmount: invested, purchaseDate: purchaseDate||(()=>{const d=new Date();d.setFullYear(d.getFullYear()-2);return d.toISOString().split("T")[0];})(), sipAmount:0, currentNAV:curNAV });
      }
      currentFund = null;
    }
  }
  return funds;
}

async function parseExcel(buffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sh = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sh, { defval: "" });
  return rows.map((r) => ({
    name: String(r["Fund Name"]||r["Scheme Name"]||r["Scheme"]||r["Fund"]||r["fund_name"]||"").trim(),
    units: parseFloat(String(r["Units"]||r["Balance Units"]||r["Bal. Units"]||r["Quantity"]||"0")),
    avgNav: parseFloat(String(r["Avg NAV"]||r["Average NAV"]||r["Purchase NAV"]||r["avg_nav"]||"0")),
    currentValue: parseFloat(String(r["Current Value"]||r["Market Value"]||r["Cur. Value"]||"0")),
    investedAmount: parseFloat(String(r["Invested Amount"]||r["Total Invested Value"]||r["Cost Value"]||"0")),
    purchaseDate: String(r["Purchase Date"]||r["Start Date"]||r["Date"]||"").trim(),
    sipAmount: parseFloat(String(r["SIP Amount"]||r["SIP Installment Amount"]||r["Monthly SIP"]||"0")),
    currentNAV: parseFloat(String(r["Current NAV"]||r["Cur. NAV"]||r["NAV"]||"0")),
  })).filter((h) => h.name && h.name.length > 3);
}

async function parseWithVision(base64, mediaType) {
  const isPDF = mediaType === "application/pdf";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 3000,
      system: "You are an expert at reading Indian mutual fund portfolio statements from NJ Wealth, Kuvera, Groww, Zerodha Coin, ET Money, CAMS CAS PDF, KFintech, MF Central, SIP Valuation Reports. Extract ALL holdings. Return ONLY valid JSON array.",
      messages: [{ role: "user", content: [
        { type: isPDF?"document":"image", source: { type:"base64", media_type:mediaType, data:base64 } },
        { type: "text", text: "Extract every mutual fund holding. Return JSON array: [{name,units,avgNav,currentValue,investedAmount,sipAmount,purchaseDate,currentNAV}]. purchaseDate as YYYY-MM-DD. Return ONLY the array." }
      ]}]
    })
  });
  const d = await res.json();
  const text = d.content?.[0]?.text || "[]";
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g,"").trim()); }
  catch { const m = text.match(/\[[\s\S]*\]/); return m?JSON.parse(m[0]):[]; }
}

async function matchToAMFI(name) {
  if (!name||name.length<3) return null;
  const clean = name.replace(/ - (Gr|Growth|Regular|Reg Gr|Direct|Dir|Div|Dividend).*$/i,"").replace(/\s+(Fund|Scheme)$/i,"").trim().substring(0,40);
  try {
    const res = await fetch("https://api.mfapi.in/mf/search?q="+encodeURIComponent(clean), { signal: AbortSignal.timeout(6000) });
    const results = await res.json();
    if (!results?.length) return null;
    const isDirect = name.toLowerCase().includes("direct");
    let match = results[0];
    for (const r of results.slice(0,10)) {
      const sn = r.schemeName.toLowerCase();
      if (isDirect && sn.includes("direct") && sn.includes("growth")) { match=r; break; }
      if (!isDirect && !sn.includes("direct") && sn.includes("growth")) { match=r; break; }
    }
    const detail = await (await fetch("https://api.mfapi.in/mf/"+match.schemeCode, { signal:AbortSignal.timeout(6000) })).json();
    return { schemeCode:String(match.schemeCode), schemeName:match.schemeName, category:detail?.meta?.scheme_category||"Equity Scheme", amc:detail?.meta?.fund_house||"" };
  } catch { return null; }
}

function parseDateStr(s) {
  if (!s) return "";
  const m = s.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m) return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
  if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s;
  return "";
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let raw = [], parseMethod = "", preEnriched = false;

    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const nj = await parseNJWealthXLS(buffer);
      if (nj.length > 0) { raw=nj; parseMethod="nj-wealth-xls"; preEnriched=true; }
      else { raw=await parseExcel(buffer); parseMethod="excel"; }
    } else if (filename.endsWith(".csv")) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buffer.toString("utf-8"), { type:"string" });
      const sh = wb.Sheets[wb.SheetNames[0]];
      raw = XLSX.utils.sheet_to_json(sh, { defval:"" }).map((r) => ({
        name: String(r["Fund Name"]||r["Scheme Name"]||r["Fund"]||"").trim(),
        units: parseFloat(String(r["Units"]||"0")),
        avgNav: parseFloat(String(r["Avg NAV"]||"0")),
        currentValue: parseFloat(String(r["Current Value"]||"0")),
        investedAmount: parseFloat(String(r["Invested Amount"]||"0")),
        purchaseDate: String(r["Purchase Date"]||"").trim(),
        sipAmount: parseFloat(String(r["SIP Amount"]||"0")),
        currentNAV: parseFloat(String(r["Current NAV"]||"0")),
      })).filter((h) => h.name && h.name.length > 3);
      parseMethod = "csv";
    } else if (filename.endsWith(".pdf")) {
      raw = await parseWithVision(buffer.toString("base64"), "application/pdf");
      parseMethod="vision-pdf"; preEnriched=true;
    } else if (filename.match(/\.(jpg|jpeg|png|webp)$/)) {
      const mt = { jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp" };
      raw = await parseWithVision(buffer.toString("base64"), mt[filename.split(".").pop()]||"image/jpeg");
      parseMethod="vision-image"; preEnriched=true;
    } else {
      return NextResponse.json({ error: "Upload .xlsx .xls .csv .pdf .jpg .png or .webp" }, { status:400 });
    }

    if (!raw.length) return NextResponse.json({ error:"No mutual fund holdings found. Make sure the file shows fund names and investment amounts.", parseMethod }, { status:422 });

    const matched=[], unmatched=[];
    for (let i=0; i<raw.length; i+=3) {
      const results = await Promise.allSettled(raw.slice(i,i+3).map(async (h) => {
        if (!h.name) return null;
        const amfi = await matchToAMFI(h.name);
        if (!amfi) { unmatched.push(h.name); return null; }
        let units=parseFloat(h.units)||0, avgNav=parseFloat(h.avgNav)||0;
        let investedAmount=parseFloat(h.investedAmount)||0, currentValue=parseFloat(h.currentValue)||0;
        let currentNAV=parseFloat(h.currentNAV)||0, sipAmount=parseFloat(h.sipAmount)||0;
        if (!units && investedAmount && avgNav) units=investedAmount/avgNav;
        if (!avgNav && investedAmount && units) avgNav=investedAmount/units;
        if (!avgNav && currentNAV) avgNav=currentNAV;
        if (!units) units=100;
        let purchaseDate = parseDateStr(h.purchaseDate);
        if (!purchaseDate) { const d=new Date(); d.setFullYear(d.getFullYear()-2); purchaseDate=d.toISOString().split("T")[0]; }
        return { ...amfi, units, avgNav, purchaseDate, sipAmount, investedAmount, preEnrichedCurrentValue:currentValue, preEnrichedCurrentNAV:currentNAV, matchConfidence:units>0&&(avgNav>0||currentNAV>0)?"high":"low", originalName:h.name, preEnriched };
      }));
      for (const r of results) if (r.status==="fulfilled"&&r.value) matched.push(r.value);
    }
    return NextResponse.json({ success:true, parseMethod, preEnriched, totalExtracted:raw.length, totalMatched:matched.length, unmatched, holdings:matched });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error:"Failed to process file: "+String(err.message) }, { status:500 });
  }
  }
