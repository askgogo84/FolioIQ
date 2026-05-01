"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Shield, TrendingUp, BarChart3, Zap, Award,
  ArrowRight, X, ChevronRight, Sparkles, MessageCircle,
  Bot, User, Send, AlertTriangle, CheckCircle2,
  Info, PieChart, Target, Lightbulb, TrendingDown,
  Wallet, Receipt, Calculator, Percent, ArrowUpRight,
  ArrowDownRight, Minus, RefreshCw, Download, Share2,
  Bell, Search, Filter, Star, Clock, Calendar,
  DollarSign, Activity, Layers, Compass, Plus, Sun, Moon,
  HelpCircle, Check, Loader2, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function useTheme() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("folioiq-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    else { setTheme("light"); localStorage.setItem("folioiq-theme", "light"); }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("folioiq-theme", newTheme);
  };
  return { theme, toggleTheme };
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function usePortfolioRealtime() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const marketOpen = now.getHours() >= 9 && now.getHours() <= 15;
      const randomFluctuation = marketOpen ? (Math.random() - 0.5) * 0.004 : 0;

      const baseValue = 553300;
      const currentValue = baseValue * (1 + randomFluctuation);
      const invested = 492000;

      setPortfolio({
        totalValue: currentValue,
        totalInvested: invested,
        totalReturns: currentValue - invested,
        totalReturnsPercent: ((currentValue - invested) / invested) * 100,
        xirr: 13.7,
        monthlySIP: 28500,
        activeSIPs: 6,
        healthScore: 80,
        fundsAtRisk: 2,
        fundsCount: 12,
        dayChange: currentValue - baseValue,
        dayChangePercent: randomFluctuation * 100,
        lastUpdated: now.toISOString(),
        funds: [
          { name: "Axis Long Term Equity", category: "ELSS", invested: 120000, currentValue: 145000 * (1 + randomFluctuation), returns: 20.8, xirr: 12.5, rating: "B", risk: "High", sipAmount: 10000, allocation: 26.2 },
          { name: "SBI Bluechip Fund", category: "Large Cap", invested: 80000, currentValue: 95000 * (1 + randomFluctuation), returns: 18.7, xirr: 11.2, rating: "A", risk: "Moderate", sipAmount: 5000, allocation: 17.2 },
          { name: "Mirae Asset Emerging", category: "Mid Cap", invested: 60000, currentValue: 78000 * (1 + randomFluctuation), returns: 30.0, xirr: 18.3, rating: "A+", risk: "High", sipAmount: 5000, allocation: 14.1 },
          { name: "Nippon India Small Cap", category: "Small Cap", invested: 50000, currentValue: 52000 * (1 + randomFluctuation * 1.5), returns: 4.0, xirr: 2.5, rating: "C", risk: "Very High", sipAmount: 3000, allocation: 9.4 },
          { name: "HDFC Balanced Advantage", category: "Balanced", invested: 45000, currentValue: 51000 * (1 + randomFluctuation * 0.8), returns: 13.3, xirr: 8.7, rating: "A", risk: "Moderate", sipAmount: 3000, allocation: 9.2 },
          { name: "ICICI Pru Liquid", category: "Liquid", invested: 36100, currentValue: 37300, returns: 3.3, xirr: 2.2, rating: "A+", risk: "Low", sipAmount: 0, allocation: 6.7 }
        ]
      });
      setLastRefresh(now);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { portfolio, loading, lastRefresh, refresh };
}

function useAIInsightsRealtime() {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  const generateAll = async (portfolio) => {
    setAILoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio, requestType: "insights" }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setInsights(result.data);
        }
      }
    } catch (err) {
      console.log("AI API not available, using fallback");
    }

    setInsights([
      { id: "1", type: "critical", title: "Small Cap Overexposure", description: "Your small cap allocation is 28% of equity, recommended max is 15%. High volatility risk in market downturns.", action: "Rebalance to Large/Mid Cap", impact: "-15% risk reduction" },
      { id: "2", type: "info", title: "ELSS Limit Not Utilized", description: "You have invested only Rs.1.2L in ELSS. Max limit is Rs.1.5L under Section 80C. Missing Rs.30K tax savings.", action: "Increase ELSS SIP by Rs.2.5K", impact: "+Rs.30K annual tax savings" },
      { id: "3", type: "warning", title: "Axis Long Term Underperforming", description: "3-year XIRR is 12.5% vs category average 15.2%. Consider switching to Quant ELSS or Canara Robeco.", action: "View Alternatives", impact: "+8-12% potential returns" },
      { id: "4", type: "success", title: "SIP Discipline Strong", description: "You have maintained 6 active SIPs for 18+ months. Consistent investing is building wealth steadily.", action: "Continue Strategy", impact: "Wealth compounding on track" }
    ]);

    setRecommendations([
      { id: "r1", type: "switch", fromFund: "Axis Long Term Equity", toFund: "Quant ELSS Fund", reason: "Quant ELSS has outperformed Axis by 4.2% CAGR over 5 years with lower volatility.", potentialReturn: "+4.2% CAGR", riskLevel: "Moderate", confidence: 87 },
      { id: "r2", type: "add", category: "International Equity", reason: "Zero international exposure. Adding 10% can reduce portfolio correlation with Indian markets.", potentialReturn: "+12% diversification benefit", riskLevel: "Moderate-High", confidence: 92 },
      { id: "r3", type: "reduce", category: "Small Cap", reason: "Current 28% allocation exceeds recommended 15%. Reduce to lower volatility and improve Sharpe ratio.", potentialReturn: "-15% volatility", riskLevel: "Low", confidence: 95 }
    ]);

    const currentValue = portfolio?.totalValue || 553300;
    const xirr = 0.137;
    setPredictions([
      { period: "1 Year", projectedValue: Math.round(currentValue * Math.pow(1 + xirr, 1)), projectedReturns: xirr * 100, confidence: 78, scenario: "base" },
      { period: "3 Years", projectedValue: Math.round(currentValue * Math.pow(1 + xirr, 3)), projectedReturns: (Math.pow(1 + xirr, 3) - 1) * 100, confidence: 65, scenario: "base" },
      { period: "5 Years", projectedValue: Math.round(currentValue * Math.pow(1 + xirr, 5)), projectedReturns: (Math.pow(1 + xirr, 5) - 1) * 100, confidence: 52, scenario: "base" }
    ]);

    setRiskAnalysis({
      overallScore: 62,
      level: "Moderate-High",
      sharpeRatio: 0.82,
      maxDrawdown: -18.5,
      categories: [
        { category: "Small Cap", allocation: 28, risk: "Very High", score: 9.2, color: "bg-red-500" },
        { category: "Mid Cap", allocation: 14, risk: "High", score: 7.8, color: "bg-amber-500" },
        { category: "Large Cap", allocation: 17, risk: "Moderate", score: 5.5, color: "bg-blue-500" },
        { category: "ELSS", allocation: 26, risk: "High", score: 7.2, color: "bg-amber-500" },
        { category: "Balanced", allocation: 9, risk: "Moderate", score: 4.8, color: "bg-emerald-500" },
        { category: "Liquid", allocation: 6, risk: "Low", score: 2.1, color: "bg-emerald-500" }
      ],
      alerts: [
        { level: "High", text: "Small cap concentration at 28% exceeds recommended 15% limit", action: "Rebalance Now" },
        { level: "Medium", text: "Only 17% in large cap - consider increasing for stability", action: "View Suggestions" },
        { level: "Low", text: "Good liquidity buffer with 6% in liquid funds", action: "Maintain" }
      ]
    });

    setAILoading(false);
  };

  return { insights, recommendations, predictions, riskAnalysis, aiLoading, generateAll };
}

function ScoreRing({ score, size, theme }) {
  const c = 2 * Math.PI * ((size - 12) / 2);
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const trackColor = theme === "dark" ? "#1e293b" : "#e2e8f0";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={(size-12)/2} fill="none" stroke={trackColor} strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={(size-12)/2} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", theme === "dark" ? "text-white" : "text-slate-900")}>{score}</span>
        <span className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>/100</span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend, icon: Icon, colorClass, theme }) {
  return (
    <motion.div whileHover={{ y: -2 }} className={cn("border rounded-xl p-5 hover:shadow-lg transition-all",
      theme === "dark" ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300")}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-500")}>{title}</span>
        <div className={cn("p-2 rounded-lg", colorClass)}><Icon className="w-4 h-4" /></div>
      </div>
      <div className={cn("text-2xl font-bold mb-1", theme === "dark" ? "text-white" : "text-slate-900")}>{value}</div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={cn("text-xs flex items-center gap-1", trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "text-slate-400")}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className={cn("text-xs", theme === "dark" ? "text-slate-500" : "text-slate-400")}>{subtitle}</span>
      </div>
    </motion.div>
  );
}

function ActionModal({ isOpen, onClose, title, children, theme }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn("rounded-2xl p-6 max-w-lg w-full shadow-2xl",
              theme === "dark" ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-200")}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn("text-lg font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>{title}</h3>
              <button onClick={onClose} className={cn("p-2 rounded-lg transition-colors", theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
                <X className={cn("w-5 h-5", theme === "dark" ? "text-slate-400" : "text-slate-500")} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AIChatPanel({ isOpen, onClose, theme }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! I am your FolioIQ AI assistant. Ask me anything about your portfolio, market trends, or investment strategies.", timestamp: new Date() }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: { message: input }, requestType: "chat" }),
      });

      if (res.ok) {
        const result = await res.json();
        const response = result.data?.rawResponse || "I am analyzing your query. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      const lowerInput = input.toLowerCase();
      let response = "I analyzed your portfolio: Health Score 80/100. Key strengths: Consistent SIP discipline, diversified across categories. Areas to improve: Small cap overexposure, underperforming ELSS, missing international allocation.";
      if (lowerInput.includes("risk")) response = "Your risk score is 6.2/10 (Moderate-High). Main concerns: 28% small cap exposure. Recommendation: Reduce small cap to 15% and add balanced advantage fund.";
      else if (lowerInput.includes("tax")) response = "You can save Rs.30,000 more! Current ELSS: Rs.1.2L (limit: Rs.1.5L). Increase Axis Long Term SIP by Rs.2,500/month.";
      else if (lowerInput.includes("return")) response = "Portfolio XIRR: 13.7%. Top: Mirae Asset Emerging (18.3%). Underperformer: Nippon Small Cap (2.5%).";
      else if (lowerInput.includes("rebalance")) response = "Reduce Nippon Small Cap to 5%, increase SBI Bluechip to 22%, add 10% international equity.";

      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn("fixed right-0 top-0 h-full w-full sm:w-[420px] border-l shadow-2xl z-50 flex flex-col",
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <div className={cn("flex items-center justify-between p-4 border-b", theme === "dark" ? "border-slate-800" : "border-slate-200")}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg"><Bot className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <h3 className={cn("font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>FolioIQ AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-500">Online</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className={cn("p-2 rounded-lg transition-colors", theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
              <X className={cn("w-5 h-5", theme === "dark" ? "text-slate-400" : "text-slate-500")} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
                  <div className={cn("p-2 rounded-lg flex-shrink-0", isUser ? "bg-emerald-500/20" : theme === "dark" ? "bg-slate-800" : "bg-slate-100")}>
                    {isUser ? <User className="w-4 h-4 text-emerald-500" /> : <Bot className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className={cn("max-w-[80%] p-3 rounded-xl text-sm",
                    isUser ? "bg-emerald-500/10 text-slate-900" : theme === "dark" ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-700")}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}
            {isTyping && (
              <div className="flex gap-3">
                <div className={cn("p-2 rounded-lg", theme === "dark" ? "bg-slate-800" : "bg-slate-100")}>
                  <Bot className="w-4 h-4 text-emerald-500" />
                </div>
                <div className={cn("p-3 rounded-xl flex items-center gap-1", theme === "dark" ? "bg-slate-800/80" : "bg-slate-100")}>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={cn("p-4 border-t", theme === "dark" ? "border-slate-800" : "border-slate-200")}>
            <div className="flex gap-2 mb-3">
              {["Risk Analysis", "Tax Tips", "Rebalance"].map((suggestion) => (
                <button key={suggestion} onClick={() => setInput(suggestion)}
                  className={cn("px-3 py-1.5 rounded-full text-xs transition-colors",
                    theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900")}>
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your portfolio..."
                className={cn("flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-500/50",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400")} />
              <button onClick={handleSend} disabled={isTyping || !input.trim()}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 rounded-xl transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PredictionInfo({ theme }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="p-1 hover:bg-slate-200/20 rounded-full transition-colors">
        <HelpCircle className={cn("w-4 h-4", theme === "dark" ? "text-slate-400" : "text-slate-500")} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className={cn("absolute right-0 top-8 w-80 p-4 rounded-xl shadow-xl z-10 text-sm",
              theme === "dark" ? "bg-slate-800 border border-slate-700 text-slate-300" : "bg-white border border-slate-200 text-slate-600")}>
            <p className="font-medium mb-2">How Predictions Work</p>
            <p className="mb-2">Our AI analyzes your portfolio's historical performance, market trends, and fund-specific data to project future values.</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-2"><span className="text-amber-500">Pessimistic:</span> Worst-case scenario (market downturn)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500">Base:</span> Most likely outcome based on historical averages</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">Optimistic:</span> Best-case scenario (bull market)</li>
            </ul>
            <p className="mt-2 text-xs opacity-70">Confidence decreases for longer timeframes. Past performance does not guarantee future results.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { portfolio, loading, lastRefresh, refresh } = usePortfolioRealtime();
  const { insights, recommendations, predictions, riskAnalysis, aiLoading, generateAll } = useAIInsightsRealtime();

  const [activeTab, setActiveTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState("base");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (portfolio) {
      generateAll(portfolio);
    }
  }, [portfolio, generateAll]);

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "recommendations", label: "AI Recommendations", icon: Lightbulb },
    { id: "predictions", label: "Predictions", icon: Target },
    { id: "risk", label: "Risk Analysis", icon: Shield }
  ];

  const formatCurrency = (val) => "Rs." + (val / 100000).toFixed(2) + "L";
  const formatPercent = (val) => (val > 0 ? "+" : "") + val.toFixed(2) + "%";
  const formatNumber = (val) => "Rs." + val.toLocaleString("en-IN");

  const bgClass = theme === "dark" ? "bg-slate-950" : "bg-slate-50";
  const textClass = theme === "dark" ? "text-white" : "text-slate-900";
  const cardBg = theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200";
  const subText = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const borderColor = theme === "dark" ? "border-slate-800" : "border-slate-200";
  const hoverBg = theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100";

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", bgClass)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className={cn("text-sm", subText)}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  const p = portfolio || {};

  return (
    <div className={cn("min-h-screen", bgClass, textClass)}>
      {/* Header */}
      <header className={cn("sticky top-0 z-40 backdrop-blur-xl border-b", theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-sm">F</span>
              </div>
              <span className={cn("font-semibold", textClass)}>FolioIQ</span>
              <span className={cn("text-xs hidden sm:inline", subText)}>| AI-Powered Portfolio Intelligence</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refresh} className={cn("p-2 rounded-xl transition-colors", hoverBg)} title="Refresh data">
                <RefreshCcw className={cn("w-5 h-5", subText)} />
              </button>
              <button onClick={toggleTheme}
                className={cn("p-2 rounded-xl transition-colors", theme === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-600 text-sm transition-all">
                <Bot className="w-4 h-4" /> AI Assistant
              </button>
              <button className={cn("p-2 rounded-xl transition-colors relative", hoverBg)}>
                <Bell className={cn("w-5 h-5", subText)} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Market Banner */}
        <div className={cn("mb-6 p-4 rounded-xl border flex items-center justify-between", 
          theme === "dark" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-600 font-medium">Live Market</span>
            </div>
            <div className={cn("text-sm", subText)}>
              Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
            </div>
            {p.dayChange !== undefined && (
              <div className={cn("text-sm font-medium", p.dayChange >= 0 ? "text-emerald-600" : "text-red-500")}>
                Today: {p.dayChange >= 0 ? "+" : ""}{formatNumber(Math.abs(p.dayChange || 0))} ({(p.dayChangePercent || 0).toFixed(2)}%)
              </div>
            )}
          </div>
          <button onClick={refresh} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : theme === "dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={cn("lg:col-span-1 border rounded-2xl p-6", cardBg)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn("font-semibold", textClass)}>Portfolio Health</h3>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium",
                    p.healthScore >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                    p.healthScore >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                  )}>{p.healthScore >= 80 ? "Healthy" : p.healthScore >= 60 ? "Fair" : "At Risk"}</span>
                </div>
                <div className="flex items-center gap-6">
                  <ScoreRing score={p.healthScore || 80} size={120} theme={theme} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>{p.fundsCount} funds tracked</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>{p.fundsAtRisk} need attention</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>XIRR: {p.xirr}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Current Value" value={formatCurrency(p.totalValue || 0)} subtitle={formatPercent(p.totalReturnsPercent || 0) + " all time"}
                  trend={p.totalReturnsPercent || 0} icon={Wallet} colorClass="bg-emerald-500/10 text-emerald-600" theme={theme} />
                <MetricCard title="Total Invested" value={formatCurrency(p.totalInvested || 0)} subtitle={"Across " + (p.fundsCount || 0) + " funds"}
                  trend={undefined} icon={PieChart} colorClass="bg-blue-500/10 text-blue-600" theme={theme} />
                <MetricCard title="Total Returns" value={formatCurrency(p.totalReturns || 0)} subtitle={"XIRR: " + (p.xirr || 0) + "%"}
                  trend={p.xirr || 0} icon={TrendingUp} colorClass="bg-emerald-500/10 text-emerald-600" theme={theme} />
                <MetricCard title="Monthly SIP" value={"Rs." + ((p.monthlySIP || 0) / 1000).toFixed(1) + "K"} subtitle={(p.activeSIPs || 0) + " active SIPs"}
                  trend={undefined} icon={Calendar} colorClass="bg-amber-500/10 text-amber-600" theme={theme} />
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-lg font-semibold flex items-center gap-2", textClass)}>
                  <Sparkles className="w-5 h-5 text-emerald-500" /> AI Insights
                </h3>
                {aiLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((insight, idx) => {
                  const Icon = insight.icon || AlertTriangle;
                  const isCritical = insight.type === "critical";
                  const isWarning = insight.type === "warning";
                  const isSuccess = insight.type === "success";

                  return (
                    <motion.div key={insight.id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      className={cn("p-5 rounded-xl border",
                        isCritical ? (theme === "dark" ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200") :
                        isWarning ? (theme === "dark" ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200") :
                        isSuccess ? (theme === "dark" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200") :
                        (theme === "dark" ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-200")
                      )}>
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg flex-shrink-0",
                          isCritical ? (theme === "dark" ? "bg-red-500/10" : "bg-red-100") :
                          isWarning ? (theme === "dark" ? "bg-amber-500/10" : "bg-amber-100") :
                          isSuccess ? (theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-100") :
                          (theme === "dark" ? "bg-blue-500/10" : "bg-blue-100")
                        )}>
                          <Icon className={cn("w-5 h-5",
                            isCritical ? "text-red-500" : isWarning ? "text-amber-500" : isSuccess ? "text-emerald-500" : "text-blue-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-medium mb-1", textClass)}>{insight.title}</h4>
                          <p className={cn("text-sm mb-3", subText)}>{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-medium",
                              isCritical ? "text-red-500" : isWarning ? "text-amber-500" : isSuccess ? "text-emerald-500" : "text-blue-500"
                            )}>{insight.impact}</span>
                            <button 
                              onClick={() => openModal(insight.title, (
                                <div className="space-y-4">
                                  <p className={subText}>{insight.description}</p>
                                  <div className={cn("p-4 rounded-xl", theme === "dark" ? "bg-emerald-500/5" : "bg-emerald-50")}>
                                    <p className={cn("text-sm font-medium", textClass)}>Recommended Action: {insight.action}</p>
                                    <p className={cn("text-sm mt-1", subText)}>Expected Impact: {insight.impact}</p>
                                  </div>
                                  <button onClick={() => setModalOpen(false)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all">
                                    Understood
                                  </button>
                                </div>
                              ))}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                              {insight.action} <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Holdings Table */}
            <div className={cn("border rounded-2xl overflow-hidden", cardBg)}>
              <div className={cn("p-6 border-b flex items-center justify-between", borderColor)}>
                <h3 className={cn("font-semibold flex items-center gap-2", textClass)}>
                  <Layers className="w-5 h-5 text-emerald-500" /> Holdings
                </h3>
                <div className="flex gap-2">
                  <button className={cn("p-2 rounded-lg transition-colors", hoverBg)}>
                    <Search className={cn("w-4 h-4", subText)} />
                  </button>
                  <button className={cn("p-2 rounded-lg transition-colors", hoverBg)}>
                    <Filter className={cn("w-4 h-4", subText)} />
                  </button>
                  <button className={cn("p-2 rounded-lg transition-colors", hoverBg)}>
                    <Download className={cn("w-4 h-4", subText)} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={cn("border-b", borderColor)}>
                      <th className={cn("text-left px-6 py-3 text-xs font-medium uppercase", subText)}>Fund</th>
                      <th className={cn("text-left px-6 py-3 text-xs font-medium uppercase", subText)}>Category</th>
                      <th className={cn("text-right px-6 py-3 text-xs font-medium uppercase", subText)}>Invested</th>
                      <th className={cn("text-right px-6 py-3 text-xs font-medium uppercase", subText)}>Value</th>
                      <th className={cn("text-right px-6 py-3 text-xs font-medium uppercase", subText)}>Returns</th>
                      <th className={cn("text-right px-6 py-3 text-xs font-medium uppercase", subText)}>XIRR</th>
                      <th className={cn("text-center px-6 py-3 text-xs font-medium uppercase", subText)}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(p.funds || []).map((fund, idx) => {
                      const isPositive = (fund.returns || 0) > 0;
                      const isGradeA = fund.rating?.startsWith("A");
                      const isGradeB = fund.rating === "B";

                      return (
                        <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                          className={cn("border-b hover:transition-colors", theme === "dark" ? "border-slate-800/50 hover:bg-slate-800/30" : "border-slate-100 hover:bg-slate-50")}>
                          <td className="px-6 py-4">
                            <div className={cn("font-medium text-sm", textClass)}>{fund.name}</div>
                            <div className={cn("text-xs", subText)}>SIP: Rs.{((fund.sipAmount || 0) / 1000).toFixed(0)}K</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs", theme === "dark" ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600")}>{fund.category}</span>
                          </td>
                          <td className={cn("px-6 py-4 text-right text-sm", theme === "dark" ? "text-slate-300" : "text-slate-600")}>{formatCurrency(fund.invested || 0)}</td>
                          <td className={cn("px-6 py-4 text-right text-sm font-medium", textClass)}>{formatCurrency(fund.currentValue || 0)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={cn("text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-500")}>
                              {isPositive ? "+" : ""}{(fund.returns || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className={cn("px-6 py-4 text-right text-sm", theme === "dark" ? "text-slate-300" : "text-slate-600")}>{(fund.xirr || 0).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                              isGradeA ? "bg-emerald-500/10 text-emerald-600" :
                              isGradeB ? "bg-amber-500/10 text-amber-600" :
                              "bg-red-500/10 text-red-600"
                            )}>
                              <Star className="w-3 h-3" /> {fund.rating}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI RECOMMENDATIONS TAB */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={cn("text-2xl font-bold flex items-center gap-2", textClass)}>
                  <Lightbulb className="w-6 h-6 text-emerald-500" /> AI Recommendations
                </h2>
                <p className={cn("mt-1", subText)}>Personalized suggestions based on your portfolio analysis</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl">
                <Brain className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">AI Confidence: 91%</span>
              </div>
            </div>

            {recommendations.map((rec, idx) => {
              const isSwitch = rec.type === "switch";
              const isAdd = rec.type === "add";

              return (
                <motion.div key={rec.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className={cn("border rounded-2xl p-6 hover:shadow-lg transition-all", cardBg)}>
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl flex-shrink-0",
                      isSwitch ? "bg-amber-500/10" : isAdd ? "bg-emerald-500/10" : "bg-blue-500/10"
                    )}>
                      {isSwitch ? <RefreshCw className="w-6 h-6 text-amber-500" /> :
                       isAdd ? <Plus className="w-6 h-6 text-emerald-500" /> :
                       <Minus className="w-6 h-6 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium",
                          isSwitch ? "bg-amber-500/10 text-amber-600" :
                          isAdd ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-blue-500/10 text-blue-600"
                        )}>{isSwitch ? "Switch Fund" : isAdd ? "Add New" : "Reduce Exposure"}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: (rec.confidence || 0) + "%" }} />
                          </div>
                          <span className={cn("text-xs", subText)}>{rec.confidence}% confidence</span>
                        </div>
                      </div>

                      {isSwitch && rec.fromFund && rec.toFund && (
                        <div className="flex items-center gap-4 mb-3">
                          <div className="text-center">
                            <div className={cn("text-sm font-medium", theme === "dark" ? "text-slate-300" : "text-slate-600")}>{rec.fromFund}</div>
                            <div className="text-xs text-red-500">Current</div>
                          </div>
                          <ArrowRight className={cn("w-5 h-5", subText)} />
                          <div className="text-center">
                            <div className="text-sm font-medium text-emerald-600">{rec.toFund}</div>
                            <div className="text-xs text-emerald-600">Recommended</div>
                          </div>
                        </div>
                      )}

                      <p className={cn("text-sm mb-4", subText)}>{rec.reason}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-600 font-medium">{rec.potentialReturn}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Shield className={cn("w-4 h-4", subText)} />
                            <span className={cn("text-sm", subText)}>Risk: {rec.riskLevel}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            openModal(isSwitch ? "Confirm Fund Switch" : "Apply Recommendation", (
                              <div className="space-y-4">
                                <p className={subText}>{rec.reason}</p>
                                <div className={cn("p-4 rounded-xl", theme === "dark" ? "bg-emerald-500/5" : "bg-emerald-50")}>
                                  <p className={cn("text-sm font-medium", textClass)}>Expected Impact: {rec.potentialReturn}</p>
                                  <p className={cn("text-sm", subText)}>Risk Level: {rec.riskLevel}</p>
                                </div>
                                {isSwitch && (
                                  <div className={cn("p-3 rounded-lg text-sm", theme === "dark" ? "bg-amber-500/5 text-amber-400" : "bg-amber-50 text-amber-700")}>
                                    Note: Switching may incur exit load (1% if within 1 year) and tax implications.
                                  </div>
                                )}
                                <div className="flex gap-3">
                                  <button onClick={() => setModalOpen(false)} className={cn("flex-1 py-3 border rounded-xl font-medium transition-all", theme === "dark" ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100")}>
                                    Cancel
                                  </button>
                                  <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all">
                                    {isSwitch ? "Confirm Switch" : "Apply"}
                                  </button>
                                </div>
                              </div>
                            ));
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                          Apply <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PREDICTIONS TAB */}
        {activeTab === "predictions" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={cn("text-2xl font-bold flex items-center gap-2", textClass)}>
                  <Target className="w-6 h-6 text-emerald-500" /> Predictive Analytics
                </h2>
                <p className={cn("mt-1", subText)}>AI-powered future value projections based on historical patterns</p>
              </div>
              <PredictionInfo theme={theme} />
            </div>

            <div className="flex gap-2">
              {(["pessimistic", "base", "optimistic"]).map((scenario) => {
                const isSelected = selectedPrediction === scenario;
                return (
                  <button key={scenario} onClick={() => setSelectedPrediction(scenario)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                      isSelected
                        ? scenario === "optimistic" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                          scenario === "base" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                          "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : theme === "dark" ? "text-slate-400 hover:bg-slate-800/50" : "text-slate-500 hover:bg-slate-100"
                    )}>{scenario}</button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {predictions.filter((pred) => pred.scenario === selectedPrediction).map((pred, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                  className={cn("border rounded-2xl p-6", cardBg)}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={subText}>{pred.period}</span>
                    <span className="px-2.5 py-1 bg-emerald-500/10 rounded-full text-xs text-emerald-600">{pred.confidence}% confidence</span>
                  </div>
                  <div className={cn("text-3xl font-bold mb-1", textClass)}>{formatCurrency(pred.projectedValue || 0)}</div>
                  <div className="text-sm text-emerald-600 mb-4">+{(pred.projectedReturns || 0).toFixed(1)}% projected</div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: (pred.confidence || 0) + "%" }} transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={cn("border rounded-2xl p-6", cardBg)}>
              <h3 className={cn("font-semibold mb-6", textClass)}>Scenario Comparison</h3>
              <div className="space-y-4">
                {(["pessimistic", "base", "optimistic"]).map((scenario) => {
                  const pred = predictions.find((p) => p.period === "1 Year" && p.scenario === scenario);
                  if (!pred) return null;
                  const maxVal = 800000;
                  const width = ((pred.projectedValue || 0) / maxVal) * 100;
                  const isOpt = scenario === "optimistic";
                  const isBase = scenario === "base";

                  return (
                    <div key={scenario} className="flex items-center gap-4">
                      <span className={cn("w-24 text-sm capitalize", subText)}>{scenario}</span>
                      <div className="flex-1 h-8 bg-slate-200 rounded-lg overflow-hidden relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: width + "%" }} transition={{ duration: 1 }}
                          className={cn("h-full rounded-lg", isOpt ? "bg-emerald-500/30" : isBase ? "bg-blue-500/30" : "bg-amber-500/30")} />
                        <span className={cn("absolute inset-0 flex items-center px-3 text-sm font-medium", textClass)}>
                          {formatCurrency(pred.projectedValue || 0)}
                        </span>
                      </div>
                      <span className={cn("text-sm font-medium", isOpt ? "text-emerald-600" : isBase ? "text-blue-600" : "text-amber-600")}>+{(pred.projectedReturns || 0).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RISK ANALYSIS TAB */}
        {activeTab === "risk" && riskAnalysis && (
          <div className="space-y-6">
            <div>
              <h2 className={cn("text-2xl font-bold flex items-center gap-2", textClass)}>
                <Shield className="w-6 h-6 text-emerald-500" /> Risk Analysis
              </h2>
              <p className={cn("mt-1", subText)}>Comprehensive risk assessment across your portfolio</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={cn("border rounded-2xl p-6", cardBg)}>
                <h3 className={cn("font-semibold mb-4", textClass)}>Overall Risk Score</h3>
                <div className="flex items-center gap-6">
                  <ScoreRing score={riskAnalysis.overallScore || 62} size={140} theme={theme} />
                  <div className="space-y-3">
                    <div>
                      <div className={cn("text-sm", subText)}>Risk Level</div>
                      <div className="text-lg font-semibold text-amber-600">{riskAnalysis.level}</div>
                    </div>
                    <div>
                      <div className={cn("text-sm", subText)}>Sharpe Ratio</div>
                      <div className={cn("text-lg font-semibold", textClass)}>{riskAnalysis.sharpeRatio}</div>
                    </div>
                    <div>
                      <div className={cn("text-sm", subText)}>Max Drawdown</div>
                      <div className="text-lg font-semibold text-red-500">{riskAnalysis.maxDrawdown}%</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className={cn("border rounded-2xl p-6", cardBg)}>
                <h3 className={cn("font-semibold mb-4", textClass)}>Category Risk Breakdown</h3>
                <div className="space-y-4">
                  {(riskAnalysis.categories || []).map((item, idx) => {
                    const isVeryHigh = item.risk === "Very High";
                    const isHigh = item.risk === "High";
                    const isModerate = item.risk === "Moderate";

                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-slate-300">{item.category}</div>
                        <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden relative">
                          <motion.div initial={{ width: 0 }} animate={{ width: (((item.score || 0) / 10) * 100) + "%" }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={cn("h-full rounded-lg", item.color || "bg-slate-500")} />
                          <span className="absolute inset-0 flex items-center px-2 text-xs text-white">{item.allocation}%</span>
                        </div>
                        <span className={cn("text-xs w-20 text-right",
                          isVeryHigh ? "text-red-500" : isHigh ? "text-amber-500" : isModerate ? "text-blue-500" : "text-emerald-500"
                        )}>{item.risk}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className={cn("border rounded-2xl p-6", cardBg)}>
              <h3 className={cn("font-semibold mb-4 flex items-center gap-2", textClass)}>
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Risk Alerts
              </h3>
              <div className="space-y-3">
                {(riskAnalysis.alerts || []).map((alert, idx) => {
                  const isHighAlert = alert.level === "High";
                  const isMediumAlert = alert.level === "Medium";

                  return (
                    <div key={idx} className={cn("flex items-center justify-between p-4 rounded-xl",
                      theme === "dark" ? "bg-slate-800/50" : "bg-slate-50"
                    )}>
                      <div className="flex items-center gap-3">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium",
                          isHighAlert ? "bg-red-500/10 text-red-500" :
                          isMediumAlert ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>{alert.level}</span>
                        <span className={cn("text-sm", theme === "dark" ? "text-slate-300" : "text-slate-600")}>{alert.text}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (alert.action === "Rebalance Now") {
                            openModal("Rebalance Portfolio", (
                              <div className="space-y-4">
                                <p className={subText}>Our AI recommends reducing small cap exposure:</p>
                                <div className="space-y-3">
                                  <div className={cn("p-3 rounded-lg border", theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                                      <span className={cn("font-medium text-sm", textClass)}>Sell Nippon Small Cap</span>
                                    </div>
                                    <p className={cn("text-xs", subText)}>Reduce by Rs.24,300 (from 9.4% to 5%)</p>
                                  </div>
                                  <div className={cn("p-3 rounded-lg border", theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                      <span className={cn("font-medium text-sm", textClass)}>Buy SBI Bluechip</span>
                                    </div>
                                    <p className={cn("text-xs", subText)}>Increase by Rs.26,500 (from 17.2% to 22%)</p>
                                  </div>
                                </div>
                                <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4" /> Confirm Rebalance
                                </button>
                              </div>
                            ));
                          } else if (alert.action === "View Suggestions") {
                            openModal("Large Cap Suggestions", (
                              <div className="space-y-4">
                                <p className={subText}>Top large cap funds to increase allocation:</p>
                                <div className="space-y-3">
                                  <div className={cn("p-4 rounded-xl border", theme === "dark" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={cn("font-semibold", textClass)}>SBI Bluechip Fund</span>
                                      <span className="px-2 py-1 bg-emerald-500/10 rounded-full text-xs text-emerald-600 font-medium">Current Holding</span>
                                    </div>
                                    <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all">
                                      Increase SIP by Rs.3,000
                                    </button>
                                  </div>
                                  <div className={cn("p-4 rounded-xl border", theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={cn("font-semibold", textClass)}>Canara Robeco Bluechip</span>
                                      <span className="px-2 py-1 bg-blue-500/10 rounded-full text-xs text-blue-600 font-medium">New</span>
                                    </div>
                                    <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all">
                                      Start New SIP - Rs.5,000
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ));
                          } else {
                            openModal("Maintain Strategy", (
                              <div className="space-y-4">
                                <div className={cn("p-4 rounded-xl", theme === "dark" ? "bg-emerald-500/5" : "bg-emerald-50")}>
                                  <p className={cn("text-sm font-medium mb-2", textClass)}>Good Job!</p>
                                  <p className={subText}>Your liquid fund allocation of 6% provides a healthy emergency buffer.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all">
                                  Continue
                                </button>
                              </div>
                            ));
                          }
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        {alert.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} theme={theme} />

      {/* Floating AI Button */}
      {!chatOpen && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 z-40 transition-all hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Action Modal */}
      <ActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} theme={theme}>
        {modalContent}
      </ActionModal>
    </div>
  );
}



