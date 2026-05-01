"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Shield, TrendingUp, BarChart3, Zap, Award,
  ArrowRight, X, ChevronRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Brain, title: "AI Analysis",
    description: "Get personalized recommendations based on your portfolio",
    color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400",
    details: ["Portfolio health scoring using ML models","Personalized fund recommendations","Risk-adjusted return predictions","Smart rebalancing suggestions"],
    action: "Analyze Portfolio", link: "/dashboard"
  },
  {
    icon: Shield, title: "Risk Assessment",
    description: "Understand your risk exposure across categories",
    color: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-400",
    details: ["Category-wise risk breakdown","Concentration risk detection","Market volatility impact analysis","Downside protection scoring"],
    action: "Check Risk", link: "/risk"
  },
  {
    icon: TrendingUp, title: "Tax Optimization",
    description: "Maximize tax savings with smart harvesting",
    color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400",
    details: ["ELSS limit utilization tracker","Tax-loss harvesting alerts","Section 80C optimization","Capital gains tax planning"],
    action: "Optimize Taxes", link: "/dashboard"
  },
  {
    icon: BarChart3, title: "Visual Analytics",
    description: "Beautiful charts for portfolio breakdown",
    color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400",
    details: ["Interactive allocation charts","Performance trend analysis","Category comparison views","Historical NAV tracking"],
    action: "View Analytics", link: "/dashboard"
  },
  {
    icon: Zap, title: "Instant Insights",
    description: "5-second portfolio health check",
    color: "from-cyan-500/20 to-sky-500/20", iconColor: "text-cyan-400",
    details: ["One-click portfolio scan","Instant red flag detection","Quick action recommendations","Real-time market alerts"],
    action: "Get Insights", link: "/dashboard"
  },
  {
    icon: Award, title: "Expert Grading",
    description: "Portfolio score with actionable fixes",
    color: "from-rose-500/20 to-red-500/20", iconColor: "text-rose-400",
    details: ["Overall portfolio grade (A-F)","Category-wise performance ratings","Fund quality assessment","Improvement action plan"],
    action: "Get Graded", link: "/dashboard"
  }
];
const insights = [
  { title: "Small Cap Overexposure", subtitle: "High risk in market downturns", severity: "warning" },
  { title: "Tax Saver ELSS Limit Not Utilized", subtitle: "Save Rs.1.5L in taxes annually", severity: "info" },
  { title: "Axis Long Term Underperforming", subtitle: "Potential 8-12% better returns", severity: "critical" }
];

function FeatureModal({ feature, isOpen, onClose }: { feature: typeof features[0]; isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  if (!isOpen || !feature) return null;
  const Icon = feature.icon;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                <Icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 mb-6">{feature.description}</p>
            <div className="space-y-3 mb-8">
              {feature.details.map((detail, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{detail}</span>
                </motion.div>
              ))}
            </div>
            <button onClick={() => { onClose(); router.push(feature.link); }}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group">
              {feature.action} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => { setIsVisible(true); }, []);

  const handleGetStarted = () => {
    if (email) localStorage.setItem("userEmail", email);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Portfolio Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Make better <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">mutual fund</span> decisions.
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-lg">
                Upload your portfolio and FolioIQ tells you what to fix, what to keep, and what to add next.
              </p>
              <div className="flex flex-wrap gap-8 mb-10">
                <div><div className="text-2xl font-bold text-white">5 sec</div><div className="text-sm text-slate-500">Portfolio Scan</div></div>
                <div><div className="text-2xl font-bold text-white">AI</div><div className="text-sm text-slate-500">Powered Checks</div></div>
                <div><div className="text-2xl font-bold text-white">Simple</div><div className="text-sm text-slate-500">Action Plan</div></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-4xl font-bold text-white">80<span className="text-lg text-slate-500">/100</span></div>
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {insights.map((insight, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        insight.severity === "critical" ? "bg-red-500/10 border-red-500/20" :
                        insight.severity === "warning" ? "bg-amber-500/10 border-amber-500/20" :
                        "bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                      <div className={`text-sm font-medium ${
                        insight.severity === "critical" ? "text-red-300" :
                        insight.severity === "warning" ? "text-amber-300" : "text-emerald-300"
                      }`}>{insight.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{insight.subtitle}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-sm text-slate-400">Enter your email to get started</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGetStarted()}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                  <button onClick={handleGetStarted}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group">
                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why FolioIQ?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to make smarter mutual fund decisions, powered by AI</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedFeature(feature)}
                  className="group relative bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to optimize your portfolio?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of investors who use FolioIQ to make smarter mutual fund decisions.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all group">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
      <FeatureModal feature={selectedFeature!} isOpen={!!selectedFeature} onClose={() => setSelectedFeature(null)} />
    </div>
  );
}
