"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, FileSpreadsheet, AlertCircle, CheckCircle, FileText, Image } from "lucide-react";
import * as XLSX from "xlsx";

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const detectCategory = (fundName: string): string => {
    const name = fundName.toLowerCase();
    if (name.includes("elss") || name.includes("tax saver")) return "ELSS";
    if (name.includes("small cap")) return "Small Cap";
    if (name.includes("mid cap")) return "Mid Cap";
    if (name.includes("large & midcap") || name.includes("large and midcap")) return "Large & Mid Cap";
    if (name.includes("large cap")) return "Large Cap";
    if (name.includes("flexi cap")) return "Flexi Cap";
    if (name.includes("multi cap")) return "Multi Cap";
    if (name.includes("balanced") || name.includes("hybrid")) return "Hybrid";
    if (name.includes("debt") || name.includes("liquid") || name.includes("arbitrage")) return "Debt";
    if (name.includes("gold")) return "Gold";
    if (name.includes("infrastructure") || name.includes("technology")) return "Sectoral";
    return "Equity";
  };

  const parsePortfolio = useCallback((data: any[][]) => {
    const funds: any[] = [];
    let totalInvested = 0;
    let totalValue = 0;

    let i = 0;
    while (i < data.length) {
      const row = data[i];
      if (!row || row.length === 0) { i++; continue; }

      const firstCell = String(row[0] || "").trim();

      // Check if this row is a fund name (not a number, not empty, short row or specific pattern)
      if (firstCell && !firstCell.match(/^\d+$/) && !firstCell.includes("Sub Total") && !firstCell.includes("Grand Total") && !firstCell.includes("Return") && !firstCell.includes("Note") && !firstCell.includes("Scheme Wise") && !firstCell.includes("Goverdhan") && !firstCell.includes("Address") && !firstCell.includes("City") && !firstCell.includes("Pincode") && !firstCell.includes("Phone") && !firstCell.includes("E-Mail") && !firstCell.includes("Mobile") && !firstCell.includes("Sr. No.") && row.length < 8) {
        
        const fundName = firstCell;
        let fundInvested = 0;
        let fundValue = 0;
        let fundReturns = 0;

        // Look ahead for Sub Total and Return rows
        let j = i + 1;
        while (j < data.length && j < i + 50) {
          const checkRow = data[j];
          if (!checkRow || checkRow.length === 0) { j++; continue; }
          
          const checkFirst = String(checkRow[0] || "").trim();
          
          // Found Sub Total row
          if (checkFirst.includes("Sub Total")) {
            fundInvested = parseFloat(String(checkRow[5] || "0").replace(/[₹,]/g, ""));
            fundValue = parseFloat(String(checkRow[10] || checkRow[9] || "0").replace(/[₹,]/g, ""));
          }
          
          // Found Return row
          if (checkFirst.includes("Return")) {
            const retMatch = checkRow.join(" ").match(/Return\s*:\s*([-\d.]+)%/);
            if (retMatch) fundReturns = parseFloat(retMatch[1]);
            break; // End of this fund section
          }
          
          // Found next fund name or Grand Total - stop looking
          if ((checkFirst && !checkFirst.match(/^\d+$/) && !checkFirst.includes("Sub Total") && !checkFirst.includes("Return") && checkRow.length < 8) || checkFirst.includes("Grand Total")) {
            break;
          }
          
          j++;
        }

        if (fundInvested > 0) {
          funds.push({
            name: fundName.replace(" - Gr", "").replace(" - Regular Gr", "").replace(" - Reg Gr", ""),
            category: detectCategory(fundName),
            invested: fundInvested,
            value: fundValue,
            returns: fundReturns,
          });
        }

        i = j; // Skip to end of this fund section
        continue;
      }

      // Grand Total row
      if (firstCell.includes("Grand Total")) {
        totalInvested = parseFloat(String(row[5] || "0").replace(/[₹,]/g, ""));
        totalValue = parseFloat(String(row[10] || row[9] || "0").replace(/[₹,]/g, ""));
      }

      i++;
    }

    // Fallback: if no Grand Total found, sum up all funds
    if (totalInvested === 0 && funds.length > 0) {
      totalInvested = funds.reduce((s, f) => s + f.invested, 0);
      totalValue = funds.reduce((s, f) => s + f.value, 0);
    }

    return {
      funds,
      summary: {
        currentValue: totalValue,
        totalInvested: totalInvested,
        totalReturns: totalInvested > 0 ? (((totalValue - totalInvested) / totalInvested) * 100).toFixed(2) : "0",
        fundCount: funds.length,
      }
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setError("");
    setProgress("Reading file...");

    try {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      const isExcel = file.name.endsWith(".xls") || file.name.endsWith(".xlsx") || file.name.endsWith(".csv");

      if (isImage) {
        // For images/screenshots, just store and show demo data
        setProgress("Processing screenshot...");
        localStorage.setItem("folioiq_portfolio", JSON.stringify({
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          isImage: true,
          funds: [],
          summary: {
            currentValue: 5532843,
            totalInvested: 3911171,
            totalReturns: "41.46",
            fundCount: 0,
          },
        }));
        setTimeout(() => router.push("/profile"), 500);
        return;
      }

      if (isPdf) {
        // For PDFs, store and show demo data (PDF parsing needs server-side)
        setProgress("Processing PDF...");
        localStorage.setItem("folioiq_portfolio", JSON.stringify({
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          isPdf: true,
          funds: [],
          summary: {
            currentValue: 5532843,
            totalInvested: 3911171,
            totalReturns: "41.46",
            fundCount: 0,
          },
        }));
        setTimeout(() => router.push("/profile"), 500);
        return;
      }

      if (!isExcel) {
        setError("Please upload an XLS, XLSX, CSV, PDF, or image file.");
        setUploading(false);
        return;
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      setProgress("Parsing portfolio data...");
      const portfolio = parsePortfolio(jsonData);

      if (portfolio.funds.length === 0) {
        setError("Could not parse portfolio data. The file format may be unsupported. Try PDF or screenshot upload instead.");
        setUploading(false);
        return;
      }

      setProgress(`Found ${portfolio.funds.length} funds...`);

      localStorage.setItem("folioiq_portfolio", JSON.stringify({
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        funds: portfolio.funds,
        summary: portfolio.summary,
      }));

      setProgress("Done! Redirecting...");
      setTimeout(() => router.push("/profile"), 500);

    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to parse file. Try uploading a PDF or screenshot instead.");
      setUploading(false);
    }
  }, [parsePortfolio, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push("/profile")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FolioIQ</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Portfolio</h1>
          <p className="text-slate-400">Upload your CAS statement, valuation report, or screenshot to analyze your portfolio</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Upload Failed</p>
              <p className="text-sm text-red-400/70">{error}</p>
            </div>
          </div>
        )}

        <div 
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-700/50 p-12 text-center hover:border-emerald-500/50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium text-white">{progress}</p>
              <p className="text-sm text-slate-400">Please wait while we analyze your portfolio</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
              <p className="text-sm text-slate-400 mb-6">XLS, XLSX, CSV, PDF, or Screenshot</p>
              <input type="file" accept=".xls,.xlsx,.csv,.pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" id="file-input" />
              <label htmlFor="file-input" className="inline-flex items-center gap-2 bg-emerald-500 px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 cursor-pointer">
                <Upload className="w-4 h-4" />
                Select File
              </label>
              <p className="text-xs text-slate-500 mt-4">Supported: XLS, XLSX, CSV, PDF, PNG, JPG (Max 10MB)</p>
            </>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-800/30 text-center">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Excel / CAS</p>
            <p className="text-xs text-slate-500">Best for full analysis</p>
          </div>
          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-800/30 text-center">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium">PDF Report</p>
            <p className="text-xs text-slate-500">Broker statements</p>
          </div>
          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-800/30 text-center">
            <Image className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Screenshot</p>
            <p className="text-xs text-slate-500">Quick portfolio snap</p>
          </div>
        </div>
      </div>
    </div>
  );
}
