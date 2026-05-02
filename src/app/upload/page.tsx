"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, TrendingUp, Loader2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", localStorage.getItem("folioiq_email") || "user@example.com");

    try {
      const res = await fetch("/api/upload-portfolio", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setResult(data);
      else setError(data.error || "Upload failed");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (n: number) => n >= 100000 ? "₹" + (n / 100000).toFixed(2) + "L" : "₹" + n.toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">FolioIQ</span>
          </div>
          <button onClick={() => window.location.href = "/profile"} className="text-sm text-slate-600 hover:text-emerald-600">← Back to Profile</button>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Portfolio</h1>
            <p className="text-slate-500">Upload your CAS statement for AI-powered analysis</p>
          </div>

          {!result && (
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-8 ${dragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"}`}>
              {!file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-2">Drag & drop your CAS statement</p>
                  <p className="text-sm text-slate-500 mb-4">PDF from CAMS/KFintech or Excel file</p>
                  <input type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium cursor-pointer hover:bg-emerald-700 transition-colors">
                    <FileText className="w-5 h-5" /> Select File
                  </label>
                  <p className="text-xs text-slate-400 mt-4">Supported: PDF (CAS), Excel, CSV</p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <button onClick={handleUpload} disabled={uploading} className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> AI Analysis</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result?.analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800 text-lg">Portfolio Analyzed!</p>
                  <p className="text-emerald-600">AI analyzed {result.holdings?.length || 0} funds</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Total Value</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(result.analysis.summary.totalCurrent)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Returns</p>
                  <p className={`text-xl font-bold ${result.analysis.summary.returnsPercent > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {result.analysis.summary.returnsPercent > 0 ? "+" : ""}{result.analysis.summary.returnsPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Funds</p>
                  <p className="text-xl font-bold text-slate-900">{result.analysis.summary.fundCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Health Score</p>
                  <p className="text-xl font-bold text-emerald-600">{result.analysis.summary.healthScore}/100</p>
                </div>
              </div>

              {result.analysis.insights?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {result.analysis.insights.map((insight: any, idx: number) => (
                      <div key={idx} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${insight.type === "critical" ? "bg-red-100" : insight.type === "warning" ? "bg-amber-100" : "bg-blue-100"}`}>
                            {insight.type === "critical" ? <AlertTriangle className="w-5 h-5 text-red-600" /> : insight.type === "warning" ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <Sparkles className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{insight.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.holdings?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Your Holdings ({result.holdings.length} Funds)</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase">Fund</th>
                          <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Value</th>
                          <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Returns</th>
                          <th className="text-center py-3 px-6 text-xs font-medium text-slate-500 uppercase">Risk</th>
                          <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.holdings.map((fund: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">{fund.name[0]}</div>
                                <div>
                                  <p className="font-medium text-sm text-slate-900">{fund.name}</p>
                                  <p className="text-xs text-slate-500">{fund.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-right"><p className="font-semibold text-sm text-slate-900">{formatCurrency(fund.current)}</p></td>
                            <td className="py-3 px-6 text-right"><span className={`text-sm font-semibold ${fund.returns > 0 ? "text-emerald-600" : "text-red-500"}`}>{fund.returns > 0 ? "+" : ""}{fund.returns.toFixed(1)}%</span></td>
                            <td className="py-3 px-6 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${fund.risk === "Low" ? "text-emerald-600 bg-emerald-50" : fund.risk === "Moderate" ? "text-blue-600 bg-blue-50" : fund.risk === "High" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>{fund.risk}</span></td>
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fund.allocation}%` }} /></div>
                                <span className="text-xs text-slate-500 w-10">{fund.allocation.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => window.location.href = "/profile"} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                  <ArrowRight className="w-5 h-5" /> View Full Dashboard
                </button>
                <button onClick={() => { setResult(null); setFile(null); }} className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5" /> Upload Another
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
