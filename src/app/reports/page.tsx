"use client";

import { useState } from "react";
import { 
  FileText, Download, Home, LayoutDashboard, Upload, Search, 
  User, Sparkles, Brain, CheckCircle, Clock, Calendar,
  TrendingUp, Shield, DollarSign, PieChart, ArrowRight
} from "lucide-react";
import Link from "next/link";

const reports = [
  {
    id: "portfolio-summary",
    name: "Portfolio Summary Report",
    description: "Complete overview of your ₹55.3L portfolio with allocation, returns, and risk analysis",
    format: "PDF",
    size: "2.4 MB",
    lastGenerated: "2026-05-03",
    icon: PieChart,
    color: "blue"
  },
  {
    id: "capital-gains",
    name: "Capital Gains Statement",
    description: "STCG and LTCG breakdown for FY 2025-26. Ready for ITR filing",
    format: "PDF / Excel",
    size: "1.1 MB",
    lastGenerated: "2026-05-03",
    icon: TrendingUp,
    color: "green"
  },
  {
    id: "tax-harvesting",
    name: "Tax Loss Harvesting Plan",
    description: "Actionable plan to save ₹28,400 in taxes with specific sell/buy recommendations",
    format: "PDF",
    size: "856 KB",
    lastGenerated: "2026-05-02",
    icon: DollarSign,
    color: "purple"
  },
  {
    id: "rebalance-plan",
    name: "Portfolio Rebalance Plan",
    description: "AI-generated rebalancing strategy: Sell 7 funds, buy 6 new ones. Expected health score: 85/100",
    format: "PDF",
    size: "1.8 MB",
    lastGenerated: "2026-05-02",
    icon: Shield,
    color: "orange"
  },
  {
    id: "transaction-history",
    name: "Transaction History",
    description: "All SIPs, lump sum buys, and redemptions from Jan 2025 to Apr 2026",
    format: "Excel (CSV)",
    size: "324 KB",
    lastGenerated: "2026-05-01",
    icon: FileText,
    color: "slate"
  },
  {
    id: "sip-summary",
    name: "Monthly SIP Summary",
    description: "Active SIPs across 17 funds. Total monthly commitment: ₹91,000",
    format: "PDF",
    size: "512 KB",
    lastGenerated: "2026-05-01",
    icon: Calendar,
    color: "cyan"
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const handleDownload = (reportId: string) => {
    setGenerating(reportId);
    setTimeout(() => {
      setGenerating(null);
      setDownloaded(prev => [...prev, reportId]);
    }, 2000);
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Export Reports</h1>
          <p className="text-slate-600">Download your portfolio data in PDF or Excel format</p>
        </div>

        <div className="grid gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            const isGenerating = generating === report.id;
            const isDownloaded = downloaded.includes(report.id);
            
            return (
              <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${report.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{report.name}</h3>
                        {isDownloaded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Downloaded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {report.format}
                        </span>
                        <span>{report.size}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Generated {report.lastGenerated}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(report.id)}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      isGenerating 
                        ? 'bg-slate-100 text-slate-500 cursor-wait' 
                        : isDownloaded
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : isDownloaded ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-blue-600 font-medium mb-1">Total Reports</p>
            <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-sm text-green-600 font-medium mb-1">Downloaded</p>
            <p className="text-2xl font-bold text-green-900">{downloaded.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <p className="text-sm text-purple-600 font-medium mb-1">Ready for CA</p>
            <p className="text-2xl font-bold text-purple-900">2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

