"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, Image as ImageIcon, Loader2, FileCheck, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"idle" | "reading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [detectedFunds, setDetectedFunds] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("folioiq_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const validExtensions = ['pdf', 'xlsx', 'xls', 'csv', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!validExtensions.includes(fileExtension)) {
      setError("Please upload PDF, Excel, CSV, or image");
      setStage("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setStage("error");
      return;
    }

    setFileName(file.name);
    setStage("reading");
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setProgress(prev => prev >= 85 ? 85 : prev + 10);
      }, 300);

      const response = await fetch("/api/upload-handler", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!response.ok) throw new Error("Failed to process");

      const data = await response.json();
      setProgress(100);
      setDetectedFunds(data.portfolio?.funds?.length || 0);

      if (data.portfolio?.funds) {
        localStorage.setItem('folioiq_portfolio', JSON.stringify(data.portfolio));
      }

      setStage("success");
      setTimeout(() => router.push('/dashboard'), 1500);

    } catch (err: any) {
      setError(err.message || "Upload failed");
      setStage("error");
    }
  }, [router]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold">FolioIQ</span>
          {email && <span className="text-sm text-gray-500 ml-auto">{email}</span>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm mb-4">Step 1</span>
        <h1 className="text-3xl font-bold mb-3">Upload Your Portfolio</h1>
        <p className="text-gray-600 mb-8">Upload CAS statement, Excel, or PDF</p>

        {stage === "idle" && (
          <div className="space-y-6">
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-semibold mb-2">{dragActive ? 'Drop here' : 'Click or drag to upload'}</p>
              <p className="text-sm text-gray-500">PDF, Excel, CSV, Images • Max 10MB</p>
            </div>
          </div>
        )}

        {stage === "reading" && (
          <div className="bg-white rounded-2xl border p-8">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
            <p className="text-gray-500 mb-4">{fileName}</p>
            <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${progress}%`}} /></div>
            <p className="text-sm text-gray-500 mt-2">{progress}%</p>
          </div>
        )}

        {stage === "success" && (
          <div className="bg-white rounded-2xl border p-8">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Uploaded!</h3>
            <p className="text-gray-500 mb-2">{fileName}</p>
            <p className="text-sm text-emerald-600 mb-4">{detectedFunds} funds detected</p>
            <p className="text-sm text-gray-400 mb-4">Redirecting to dashboard...</p>
            <button onClick={() => router.push('/dashboard')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
              Go to Dashboard →
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-white rounded-2xl border border-red-200 p-8">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Failed</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={() => { setStage("idle"); setError(""); }} className="bg-gray-900 text-white px-6 py-2 rounded-lg">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
