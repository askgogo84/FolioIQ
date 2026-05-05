"use client";

import Link from "next/link";
import { 
  Sparkles, ArrowRight, TrendingUp, Shield, Brain, Target, 
  Zap, DollarSign, PieChart, MessageSquare, RefreshCw, 
  Scale, Calculator, History, Globe, FileText, FileUp, Activity,
  ChevronRight, CheckCircle, AlertTriangle, LogIn, UserPlus
} from "lucide-react";

const portfolioStats = {
  value: "₹55,32,843",
  returns: "+12.5%",
  healthScore: 68,
  funds: 17,
  sip: "₹91,000",
  taxSaved: "₹28,400"
};

const features = [
  { icon: Brain, title: "AI Portfolio Intelligence", desc: "Health score, risk analysis, and smart alerts for every fund", color: "purple", href: "/intelligence", badge: "New" },
  { icon: RefreshCw, title: "Smart Rebalancing", desc: "One-click fix for your portfolio. Sell losers, buy winners.", color: "blue", href: "/rebalance", badge: null },
  { icon: DollarSign, title: "Tax Loss Harvesting", desc: "Legally save thousands in taxes. Calculator + action plan.", color: "green", href: "/tax-harvesting", badge: "Save ₹28K" },
  { icon: Target, title: "Goal-Based Planning", desc: "Link funds to life goals. Track Child Education, Retirement, Home.", color: "orange", href: "/goals", badge: null },
  { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask anything: 'Should I sell ICICI Tech?' Get instant answers.", color: "indigo", href: "/chat", badge: "AI" },
  { icon: Scale, title: "Fund Comparison", desc: "Compare 2-3 funds side-by-side. See which wins on every metric.", color: "pink", href: "/compare", badge: null },
  { icon: Calculator, title: "SIP Calculator", desc: "Plan with step-up SIP. See how much wealth you'll create.", color: "cyan", href: "/calculator", badge: null },
  { icon: FileText, title: "Capital Gains Report", desc: "Tax-ready report for ITR filing. STCG, LTCG, exemptions.", color: "amber", href: "/capital-gains", badge: "Tax Ready" },
];

const whyFolioIQ = [
  { icon: CheckCircle, text: "AI-powered fund ratings (Buy/Hold/Sell)" },
  { icon: CheckCircle, text: "Tax loss harvesting calculator" },
  { icon: CheckCircle, text: "One-click portfolio rebalancing" },
  { icon: CheckCircle, text: "Goal-based SIP planning" },
  { icon: CheckCircle, text: "Capital gains report for ITR" },
  { icon: CheckCircle, text: "Real-time market overview" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50 opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Portfolio Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Your Money, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Smarter</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Upload your portfolio. Get AI analysis. Save taxes. Rebalance smartly. 
              All in one intelligent dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth?signup=true" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Portfolio Snapshot */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-80">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-slate-500 font-medium">Portfolio Value</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{portfolioStats.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">{portfolioStats.returns}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm text-slate-500 font-medium">Health Score</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{portfolioStats.healthScore}<span className="text-lg text-slate-400">/100</span></p>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${portfolioStats.healthScore}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-slate-500 font-medium">Funds Tracked</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{portfolioStats.funds}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-slate-500 font-medium">Tax Savings</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{portfolioStats.taxSaved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">20+ Powerful Tools</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to analyze, optimize, and grow your mutual fund portfolio</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Link key={i} href={feature.href}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                {feature.badge && (
                  <span className={`px-2 py-1 bg-${feature.color}-100 text-${feature.color}-700 rounded-full text-xs font-bold`}>
                    {feature.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Why FolioIQ */}
      <div className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Investors Choose FolioIQ</h2>
              <div className="space-y-4">
                {whyFolioIQ.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">All Your Tools in One Place</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Brain, label: "AI Insights" },
                  { icon: RefreshCw, label: "Rebalance" },
                  { icon: DollarSign, label: "Tax Save" },
                  { icon: Target, label: "Goals" },
                  { icon: Scale, label: "Screener" },
                  { icon: Globe, label: "Market" },
                  { icon: FileText, label: "Reports" },
                  { icon: Activity, label: "Live NAV" },
                ].map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100">
                    <tool.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{tool.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Optimize Your Portfolio?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Create your free account and get instant AI analysis of your mutual fund portfolio.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth?signup=true" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg">
            <UserPlus className="w-5 h-5" />
            Create Free Account
          </Link>
          <Link href="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            <LogIn className="w-5 h-5" />
            I Already Have an Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FolioIQ</span>
              </div>
              <p className="text-sm">AI-powered mutual fund portfolio analysis for Indian investors.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/intelligence" className="hover:text-white transition-colors">AI Insights</Link></li>
                <li><Link href="/rebalance" className="hover:text-white transition-colors">Rebalancing</Link></li>
                <li><Link href="/tax-harvesting" className="hover:text-white transition-colors">Tax Harvesting</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors">SIP Calculator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Portfolio</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/goals" className="hover:text-white transition-colors">Goals</Link></li>
                <li><Link href="/transactions" className="hover:text-white transition-colors">Transactions</Link></li>
                <li><Link href="/capital-gains" className="hover:text-white transition-colors">Tax Report</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/chat" className="hover:text-white transition-colors">AI Assistant</Link></li>
                <li><Link href="/compare" className="hover:text-white transition-colors">Compare Funds</Link></li>
                <li><Link href="/market" className="hover:text-white transition-colors">Market Overview</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>FolioIQ. Not financial advice. Consult a SEBI-registered advisor before investing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
