// components/upload-hero.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ArrowRight, Sparkles, Lock } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

export default function UploadHero() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <section className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Smarter than INDmoney
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
          Understand Your Mutual Funds<br />
          <span className="gradient-text">Like Never Before</span>
        </h1>

        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload your CAS statement. Get instant analysis: which funds to 
          <span className="text-success font-semibold"> continue</span>, 
          <span className="text-warning font-semibold"> pause</span>, or 
          <span className="text-danger font-semibold"> stop</span>. 
          See real post-tax returns, not misleading headline numbers.
        </p>

        {/* Upload Zone */}
        <div className="max-w-xl mx-auto">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
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

            {uploadedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-success" />
                </div>
                <p className="text-lg font-medium text-text-primary">{uploadedFile.name}</p>
                <p className="text-sm text-text-secondary">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <SignUpButton mode="modal">
                  <button className="btn-primary inline-flex items-center gap-2">
                    Analyze Portfolio <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <p className="text-lg font-medium text-text-primary">
                  Drop your CAS statement here
                </p>
                <p className="text-sm text-text-secondary">
                  PDF, Excel, or CSV from CAMS / Karvy
                </p>
                <p className="text-xs text-text-muted">
                  Or click to browse files
                </p>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-text-muted">
            <Lock className="w-3 h-3" />
            <span>Your data is encrypted and never shared. We only read fund names and units.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
