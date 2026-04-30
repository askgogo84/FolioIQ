"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
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
    let currentFund = "";
    let totalInvested = 0;
    let totalValue = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || "").trim();

      if (firstCell && !firstCell.match(/^\d+$/) && !firstCell.includes("Sub Total") && !firstCell.includes("Grand Total") && !firstCell.includes("Return") && !firstCell.includes("Note") && row.length < 5) {
        currentFund = firstCell;
        continue;
      }

      if (firstCell.includes("Sub Total") && currentFund) {
        const invested = parseFloat(String(row[5] || "0").replace(/[₹,]/g, ""));
        const value = parseFloat(String(row[10] || "0").replace(/[₹,]/g, ""));
        
        const nextRow = data[i + 1];
        const nextRowStr = Array.isArray(nextRow) ? nextRow.join(" ") : String(nextRow || "");
        const retMatch = nextRowStr.match(/Return\s*:\s*([-\d.]+)%/);
        const returns = retMatch ? parseFloat(retMatch[1]) : 0;

        if (invested > 0) {
          funds.push({
            name: currentFund.replace(" - Gr", "").replace(" - Regular Gr", "").replace(" - Reg Gr", ""),
            category: detectCategory(currentFund),
            invested: invested,
            value: value,
            returns: returns,
          });
        }
        currentFund = "";
      }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      const rowStr = row.join(" ");
      if (rowStr.includes("Grand Total")) {
        totalInvested = parseFloat(String(row[5] || "0").replace(/[₹,]/g, ""));
        totalValue = parseFloat(String(row[10] || "0").replace(/[₹,]/g, ""));
      }
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
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      setProgress("Parsing portfolio data...");
      const portfolio = parsePortfolio(jsonData);

      if (portfolio.funds.length === 0) {
        setError("Could not parse portfolio data. Please upload a valid CAS/valuation report.");
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
      setTimeout(() => {
        router.push("/profile");
      }, 500);

    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to parse file. Please try a different file format (XLS, XLSX, CSV).");
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
          <p className="text-slate-400">Upload your CAS statement or valuation report to analyze your portfolio</p>
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
              <p className="text-sm text-slate-400 mb-6">or click to browse</p>
              <input type="file" accept=".xls,.xlsx,.csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" id="file-input" />
              <label htmlFor="file-input" className="inline-flex items-center gap-2 bg-emerald-500 px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 cursor-pointer">
                <Upload className="w-4 h-4" />
                Select File
              </label>
              <p className="text-xs text-slate-500 mt-4">Supported: XLS, XLSX, CSV (Max 10MB)</p>
            </>
          )}
        </div>

        <div className="mt-8 bg-slate-900/30 rounded-xl p-6 border border-slate-800/30">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            How to get your file
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Log in to your broker (Zerodha, Groww, NJ India, etc.)</li>
            <li>• Download your CAS (Consolidated Account Statement)</li>
            <li>• Or download your portfolio valuation report</li>
            <li>• Upload the XLS/XLSX file here</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
