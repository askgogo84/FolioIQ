"use client";

import { useState } from "react";
import { 
  FileUp, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  CheckCircle, AlertCircle, FileText, ArrowRight, Shield, Zap,
  X, ChevronRight
} from "lucide-react";
import Link from "next/link";

const steps = [
  { id: 1, title: "Upload PDF", description: "Select your CAMS/Karvy CAS statement", status: "current" },
  { id: 2, title: "AI Parsing", description: "Extracting funds, values, SIPs automatically", status: "pending" },
  { id: 3, title: "Review Data", description: "Verify extracted portfolio details", status: "pending" },
  { id: 4, title: "Save to Portfolio", description: "Update your dashboard with new data", status: "pending" },
];

const sampleExtracted = [
  { fund: "Parag Parikh Flexi Cap", folio: "12345678", units: 1574.32, nav: 401.61, value: 632035, sip: 5000, date: "2026-04-15" },
  { fund: "Nippon India Small Cap", folio: "12345679", units: 1479.12, nav: 353.11, value: 522494, sip: 10000, date: "2026-04-15" },
  { fund: "Invesco India Gold ETF FoF", folio: "12345680", units: 998.15, nav: 724.00, value: 723776, sip: 0, date: "2026-04-15" },
  { fund: "ICICI Pru Technology", folio: "12345681", units: 868.42, nav: 237.08, value: 206017, sip: 10000, date: "2026-04-15" },
];

export default function ParseCASPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleParse = () => {
    setIsParsing(true);
    setCurrentStep(2);
    setTimeout(() => {
      setCurrentStep(3);
      setIsParsing(false);
    }, 3000);
  };

  const handleSave = () => {
    setCurrentStep(4);
    setIsComplete(true);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FolioIQ</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">PDF CAS Parser</h1>
          <p className="text-slate-600">Upload your CAMS or Karvy CAS statement. We will extract all your fund data automatically.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.id < currentStep ? 'bg-green-500 text-white' :
                  step.id === currentStep ? 'bg-blue-600 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <p className={`text-xs font-medium mt-2 ${step.id <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-blue-400 transition-colors">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileUp className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Drop your CAS PDF here</h3>
            <p className="text-slate-500 mb-6">or click to browse from your computer</p>
            <p className="text-xs text-slate-400 mb-6">Supported: CAMS, Karvy, FTmail PDFs. Max 10MB.</p>
            <button 
              onClick={handleParse}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Select PDF File
            </button>
          </div>
        )}

        {/* Step 2: Parsing */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">AI is parsing your PDF...</h3>
            <p className="text-slate-500">Extracting funds, folio numbers, NAVs, SIP amounts</p>
            <div className="mt-6 max-w-md mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Review Extracted Data</h3>
                <p className="text-sm text-slate-500">{sampleExtracted.length} funds found in your CAS</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Parsed Successfully
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {sampleExtracted.map((fund, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{fund.fund}</p>
                      <p className="text-xs text-slate-500">Folio: {fund.folio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{fund.units.toFixed(2)} units</p>
                      <p className="text-xs text-slate-500">@ ₹{fund.nav}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₹{(fund.value / 100000).toFixed(1)}L</p>
                      <p className="text-xs text-slate-500">Current Value</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{fund.sip > 0 ? `₹${fund.sip.toLocaleString()}` : 'No SIP'}</p>
                      <p className="text-xs text-slate-500">Monthly SIP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Save to Portfolio
              </button>
              <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                Edit Data
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Portfolio Updated!</h3>
            <p className="text-slate-500 mb-6">{sampleExtracted.length} funds have been added to your dashboard</p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                View Dashboard
              </Link>
              <Link href="/intelligence" className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                Get AI Analysis
              </Link>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">Bank-Grade Security</p>
            <p className="text-xs text-slate-500">Your PDF is processed locally and never stored on our servers. All data is encrypted in transit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
