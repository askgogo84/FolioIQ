// components/portfolio-uploader.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function PortfolioUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) validateAndSetFile(files[0]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setResult({ success: false, message: "Please upload a PDF, Excel, or CSV file" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResult({ success: false, message: "File size must be under 10MB" });
      return;
    }

    setFile(file);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Successfully parsed ${data.holdings?.length || 0} funds`,
          count: data.holdings?.length 
        });

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        setResult({ success: false, message: data.error || "Failed to process file" });
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Upload Portfolio</h1>
        <p className="text-text-secondary">
          Upload your CAS statement from CAMS/Karvy or an Excel export from your broker
        </p>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300
            ${isDragging 
              ? 'border-accent bg-accent/5 scale-[1.02]' 
              : 'border-border bg-surface hover:border-accent/50'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-10 h-10 text-accent" />
            </div>
            <div>
              <p className="text-lg font-medium text-text-primary">Drop your file here</p>
              <p className="text-sm text-text-secondary mt-1">or click to browse</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Excel</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> CSV</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{file.name}</p>
              <p className="text-sm text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={clearFile}
              className="text-text-muted hover:text-danger transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Analyze Portfolio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`
          mt-4 p-4 rounded-xl flex items-center gap-3
          ${result.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
        `}>
          {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{result.message}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-medium text-text-primary mb-2">How to get CAS</h3>
          <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
            <li>Visit <a href="https://www.camsonline.com" target="_blank" className="text-accent hover:underline">CAMS Online</a></li>
            <li>Click "CAS Statement"</li>
            <li>Enter PAN and password</li>
            <li>Download PDF</li>
          </ol>
        </div>
        <div className="card p-4">
          <h3 className="font-medium text-text-primary mb-2">What we read</h3>
          <ul className="text-sm text-text-secondary space-y-1.5">
            <li>✓ Fund names & ISIN codes</li>
            <li>✓ Units held & NAV</li>
            <li>✓ Purchase dates</li>
            <li>✗ No bank details</li>
            <li>✗ No personal info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
