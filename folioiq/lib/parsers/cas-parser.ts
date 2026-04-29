// lib/parsers/cas-parser.ts
import * as XLSX from "xlsx";
import type { FundHolding } from "@/types/portfolio";

export async function parseCASStatement(buffer: Buffer, filename: string): Promise<Partial<FundHolding>[]> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return parsePDF(buffer);
  } else if (ext === "xlsx" || ext === "xls") {
    return parseExcel(buffer);
  } else if (ext === "csv") {
    return parseCSV(buffer);
  }

  throw new Error("Unsupported file format");
}

async function parsePDF(buffer: Buffer): Promise<Partial<FundHolding>[]> {
  // For PDF parsing, we would use pdf-parse
  // Since it's complex, this is a simplified version
  // In production, you'd use more sophisticated regex patterns

  try {
    const pdf = await import("pdf-parse");
    const data = await pdf.default(buffer);
    const text = data.text;

    // Extract holdings using regex patterns for Indian CAS statements
    const holdings: Partial<FundHolding>[] = [];

    // Pattern for scheme name followed by ISIN and units
    const schemePattern = /([A-Z][A-Za-z\s\-]+(?:Fund|Scheme|Plan)).*?([A-Z]{2}[0-9]{10}).*?([0-9]+\.?[0-9]*)/g;

    let match;
    while ((match = schemePattern.exec(text)) !== null) {
      holdings.push({
        scheme_name: match[1].trim(),
        isin: match[2],
        units: parseFloat(match[3]),
      });
    }

    return holdings;
  } catch {
    // Fallback: return empty for now, implement proper parsing
    return [];
  }
}

function parseExcel(buffer: Buffer): Partial<FundHolding>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const holdings: Partial<FundHolding>[] = [];

  // Find header row
  let headerRow = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (row && row.some(cell => 
      String(cell).toLowerCase().includes("scheme") ||
      String(cell).toLowerCase().includes("isin") ||
      String(cell).toLowerCase().includes("units")
    )) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) return [];

  const headers = data[headerRow].map(h => String(h).toLowerCase().trim());

  // Find column indices
  const schemeIdx = headers.findIndex(h => h.includes("scheme") || h.includes("fund"));
  const isinIdx = headers.findIndex(h => h.includes("isin"));
  const unitsIdx = headers.findIndex(h => h.includes("units") || h.includes("balance"));
  const navIdx = headers.findIndex(h => h.includes("nav") || h.includes("price"));
  const valueIdx = headers.findIndex(h => h.includes("value") || h.includes("amount"));

  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const schemeName = schemeIdx >= 0 ? String(row[schemeIdx]).trim() : "";
    if (!schemeName || schemeName.toLowerCase().includes("total")) continue;

    holdings.push({
      scheme_name: schemeName,
      isin: isinIdx >= 0 ? String(row[isinIdx]) : "",
      units: unitsIdx >= 0 ? parseFloat(String(row[unitsIdx]).replace(/,/g, "")) || 0 : 0,
      nav: navIdx >= 0 ? parseFloat(String(row[navIdx]).replace(/,/g, "")) || 0 : 0,
      current_value: valueIdx >= 0 ? parseFloat(String(row[valueIdx]).replace(/,/g, "")) || 0 : 0,
    });
  }

  return holdings;
}

function parseCSV(buffer: Buffer): Partial<FundHolding>[] {
  const text = buffer.toString("utf-8");
  const lines = text.split("\n");

  const holdings: Partial<FundHolding>[] = [];

  // Simple CSV parsing - assumes headers in first row
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.toLowerCase().trim());
  const schemeIdx = headers.findIndex(h => h.includes("scheme"));
  const isinIdx = headers.findIndex(h => h.includes("isin"));
  const unitsIdx = headers.findIndex(h => h.includes("units"));

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 2) continue;

    holdings.push({
      scheme_name: schemeIdx >= 0 ? cols[schemeIdx].trim() : "",
      isin: isinIdx >= 0 ? cols[isinIdx].trim() : "",
      units: unitsIdx >= 0 ? parseFloat(cols[unitsIdx]) || 0 : 0,
    });
  }

  return holdings;
}
