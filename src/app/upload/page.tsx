"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, X, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      setUploadStatus(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
      setUploadStatus(null);
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please select a file first.' });
      return;
    }
    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus({ type: 'success', message: result.message || 'Portfolio uploaded!' });
        setFiles([]);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Upload failed.' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Upload Portfolio</h1>
          <p className="text-slate-500">Upload your CAS statement for AI-powered analysis</p>
        </div>

        {/* Drop Zone with Click */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop your files here</h3>
          <p className="text-slate-500 mb-1">or click anywhere in this box to browse</p>
          <p className="text-xs text-slate-400">PDF, CSV, Excel (Max 10MB)</p>
          
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls" onChange={handleFileSelect} multiple />
          
          <button onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Browse Files
          </button>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Selected Files ({files.length})</h3>
            </div>
            {files.map((file, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <File className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="p-2 hover:bg-red-50 rounded-lg">
                  <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button onClick={handleUpload} disabled={uploading}
              className={`px-8 py-3 rounded-lg font-medium text-white flex items-center gap-2 ${
                uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                : <><Upload className="h-4 w-4" /> Upload & Analyze</>}
            </button>
          </div>
        )}

        {/* Status */}
        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
            uploadStatus.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          }`}>
            {uploadStatus.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500" />
              : <AlertCircle className="h-5 w-5 text-red-500" />}
            <p className={uploadStatus.type === 'success' ? 'text-emerald-700' : 'text-red-700'}>{uploadStatus.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
