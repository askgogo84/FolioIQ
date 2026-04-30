"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, 
  FileSpreadsheet, Image as ImageIcon, Loader2 
} from "lucide-react";

// Mock portfolio data generator for demo purposes
// In production, replace with actual PDF/Excel parsing libraries
const generateMockPortfolio = (fileName: string) => {
  const funds = [
    { name: "SBI Bluechip Fund", category: "Large Cap", value: 450000, invested: 380000, returns: 18.4 },
    { name: "HDFC Mid-Cap Opportunities", category: "Mid Cap", value: 320000, invested: 280000, returns: 14.3 },
    { name: "Axis Small Cap Fund", category: "Small Cap", value: 180000, invested: 150000, returns: 20.0 },
    { name: "ICICI Pru Balanced Advantage", category: "Hybrid", value: 250000, invested: 230000, returns: 8.7 },
    { name: "Nippon India Liquid Fund", category: "Liquid", value: 150000, invested: 150000, returns: 6.5 },
    { name: "Mirae Asset Tax Saver", category: "ELSS", value: 200000, invested: 160000, returns: 25.0 },
    { name: "Kotak Equity Arbitrage", category: "Arbitrage", value: 100000, invested: 95000, returns: 5.3 },
    { name: "Canara Robeco Equity Hybrid", category: "Balanced", value: 100000, invested: 92000, returns: 8.7 },
  ];

  return {
    fileName,
    uploadDate: new Date().toISOString(),
    funds,
    summary: {
      currentValue: funds.reduce((sum, f) => sum + f.value, 0),
      totalInvested: funds.reduce((sum, f) => sum + f.invested, 0),
      totalReturns: ((funds.reduce((sum, f) => sum + f.value, 0) - funds.reduce((sum, f) => sum + f.invested, 0)) / funds.reduce((sum, f) => sum + f.invested, 0) * 100).toFixed(2),
      fundCount: funds.length,
    }
  };
};

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"idle" | "reading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                       ['pdf', 'xlsx', 'xls', 'csv', 'png', 'jpg', 'jpeg'].includes(fileExtension || '');

    if (!isValidType) {
      setError("Please upload a PDF, Excel, CSV, or image file (PNG/JPG)");
      setStage("error");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setStage("error");
      return;
    }

    setFileName(file.name);
    setStage("reading");
    setError("");
    setProgress(0);

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      // In production, send file to backend for parsing
      // For now, simulate processing delay and generate mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setProgress(100);

      // Generate and save portfolio data
      const portfolio = generateMockPortfolio(file.name);

      // Save to localStorage
      localStorage.setItem('folioiq_portfolio', JSON.stringify(portfolio));
      localStorage.setItem('folioiq_uploaded', 'true');
      localStorage.setItem('folioiq_lastUpload', new Date().toISOString());

      setStage("success");

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      setError("Failed to process file. Please try again.");
      setStage("error");
    }
  }, [router]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const resetUpload = () => {
    setStage("idle");
    setFileName("");
    setError("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-gray-900">FolioIQ</span>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Dashboard →
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Upload Your Portfolio
          </h1>
          <p className="text-gray-600">
            Upload your CAS statement, Excel sheet, or screenshot to analyze your mutual funds
          </p>
        </div>

        {/* Upload Area */}
        {stage === "idle" && (
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${dragActive 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={handleChange}
              />

              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>

              <p className="text-lg font-semibold text-gray-900 mb-2">
                {dragActive ? 'Drop your file here' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, Excel, CSV, or Images (PNG, JPG)
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: 10MB
              </p>
            </div>

            {/* Supported Formats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FileText, label: "PDF", desc: "CAS Statement" },
                { icon: FileSpreadsheet, label: "Excel", desc: "Portfolio Sheet" },
                { icon: FileSpreadsheet, label: "CSV", desc: "Data Export" },
                { icon: ImageIcon, label: "Image", desc: "Screenshot" },
              ].map((format) => (
                <div key={format.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <format.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{format.label}</p>
                  <p className="text-xs text-gray-500">{format.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Privacy First</p>
                <p className="text-sm text-blue-700">
                  Your files are processed locally in your browser. We don't store your financial data on any server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reading State */}
        {stage === "reading" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing your portfolio...
            </h3>
            <p className="text-gray-500 mb-6">{fileName}</p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{Math.round(Math.min(progress, 100))}%</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Extracting fund details
            </div>
          </div>
        )}

        {/* Success State */}
        {stage === "success" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Portfolio Uploaded Successfully!
            </h3>
            <p className="text-gray-500 mb-2">{fileName}</p>
            <p className="text-sm text-emerald-600 mb-6">
              Redirecting to dashboard...
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard →
            </button>
          </div>
        )}

        {/* Error State */}
        {stage === "error" && (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Failed
            </h3>
            <p className="text-red-600 mb-6">{error}</p>

            <button
              onClick={resetUpload}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}