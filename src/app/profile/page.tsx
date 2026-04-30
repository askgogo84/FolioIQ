"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  TrendingUp, Shield, AlertTriangle, Activity,
  Upload, ArrowRight, Wallet, Building2,
  AlertCircle, ChevronRight, RefreshCw, Zap,
  Target, BarChart3, PieChart as PieIcon,
  User, LogOut, Bell, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────
interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercent: number;
  riskScore: number;
  diversificationScore: number;
  healthScore: number;
  investmentScore: number;
  riskAppetite: "Conservative" | "Moderate" | "Aggressive";
  totalFunds: number;
  totalAmcs: number;
  fundsAtRisk: number;
  monthlyData: { month: string; value: number }[];
  allocation: { name: string; value: number; color: string }[];
  topHoldings: { name: string; value: number; percent: number; return: number }[];
}

// ─── Demo Data (shown before first upload) ──────────
const DEMO_DATA: PortfolioData = {
  totalValue: 0,
  totalInvested: 0,
  totalReturn: 0,
  returnPercent: 0,
  riskScore: 0,
  diversificationScore: 0,
  healthScore: 0,
  investmentScore: 0,
  riskAppetite: "Moderate",
  totalFunds: 0,
  totalAmcs: 0,
  fundsAtRisk: 0,
  monthlyData: [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
  ],
  allocation: [
    { name: "Equity", value: 0, color: "#10b981" },
    { name: "Debt", value: 0, color: "#3b82f6" },
    { name: "Hybrid", value: 0, color: "#f59e0b" },
    { name: "Liquid", value: 0, color: "#06b6d4" },
  ],
  topHoldings: [],
};

// ─── Score Ring (Dark Theme) ────────────────────────
function ScoreRing({ score, label, color, icon: Icon, size = 140 }: {
  score: number; label: string; color: string;
  icon: React.ElementType; size?: number;
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1e293b" strokeWidth="10"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-[10px] text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <Badge 
        className="text-xs border-0 font-semibold" 
        style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
      >
        {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work"}
      </Badge>
    </div>
  );
}

// ─── Stat Card (Dark) ───────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, color, delay = 0 }: {
  icon: React.ElementType; label: string; value: string;
  subtext?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
              {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
            </div>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEMO_DATA);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    setUser(session.user);
    
    // Check if user has portfolio data
    const { data: portfolioData } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    
    if (portfolioData) {
      setHasData(true);
      setPortfolio({
        ...DEMO_DATA,
        totalValue: 2450000,
        totalInvested: 2100000,
        totalReturn: 350000,
        returnPercent: 16.67,
        riskScore: 72,
        diversificationScore: 85,
        healthScore: 78,
        investmentScore: 80,
        riskAppetite: "Moderate",
        totalFunds: 12,
        totalAmcs: 8,
        fundsAtRisk: 2,
        monthlyData: [
          { month: "Jan", value: 2100000 },
          { month: "Feb", value: 2150000 },
          { month: "Mar", value: 2080000 },
          { month: "Apr", value: 2250000 },
          { month: "May", value: 2380000 },
          { month: "Jun", value: 2450000 },
        ],
        allocation: [
          { name: "Equity", value: 55, color: "#10b981" },
          { name: "Debt", value: 30, color: "#3b82f6" },
          { name: "Hybrid", value: 10, color: "#f59e0b" },
          { name: "Liquid", value: 5, color: "#06b6d4" },
        ],
        topHoldings: [
          { name: "SBI Bluechip Fund", value: 450000, percent: 18.4, return: 22.5 },
          { name: "HDFC Top 100", value: 380000, percent: 15.5, return: 18.2 },
          { name: "Axis Midcap", value: 320000, percent: 13.1, return: 28.4 },
          { name: "Nippon India Small Cap", value: 280000, percent: 11.4, return: 35.1 },
        ],
      });
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ─── Top Navigation ─────────────────────────── */}
      <nav className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                FolioIQ
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/upload")}
                className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" />
                {hasData ? "Update" : "Upload"}
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm text-slate-400 hidden sm:block">
                  {user?.email?.split("@")[0]}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Welcome + Portfolio Value ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Portfolio Overview
              </h1>
              <p className="text-slate-400 mt-1">
                {hasData 
                  ? "Here's how your investments are performing" 
                  : "Upload your portfolio to unlock personalized insights"}
              </p>
            </div>
            {hasData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Current Value</p>
                    <p className="text-3xl font-bold text-white">
                      ₹{(portfolio.totalValue / 100000).toFixed(2)}L
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={portfolio.returnPercent >= 0 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                        : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }>
                        {portfolio.returnPercent >= 0 ? "+" : ""}{portfolio.returnPercent}%
                      </Badge>
                      <span className="text-xs text-slate-500">
                        ₹{(portfolio.totalReturn / 100000).toFixed(1)}L returns
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Empty State / Upload CTA ───────────────── */}
        {!hasData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Get Started with Your Portfolio</h2>
                <p className="text-emerald-100 mb-6 max-w-md mx-auto">
                  Upload your mutual fund CAS statement to unlock AI-powered insights, risk analysis, and personalized recommendations.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push("/upload")}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 font-semibold"
                >
                  Upload Portfolio Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Score Rings ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <ScoreRing
              score={portfolio.investmentScore}
              label="Investment Score"
              color="#10b981"
              icon={Target}
            />
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <ScoreRing
              score={portfolio.diversificationScore}
              label="Diversification"
              color="#3b82f6"
              icon={PieIcon}
            />
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <ScoreRing
              score={portfolio.healthScore}
              label="Health Score"
              color="#f59e0b"
              icon={Activity}
            />
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <ScoreRing
              score={portfolio.riskScore}
              label="Risk Score"
              color="#ef4444"
              icon={Shield}
            />
          </div>
        </div>

        {/* ─── Stats Grid ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Wallet}
            label="Total Invested"
            value={hasData ? `₹${(portfolio.totalInvested / 100000).toFixed(1)}L` : "—"}
            subtext="Initial capital"
            color="#10b981"
            delay={0}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Return"
            value={hasData ? `₹${(portfolio.totalReturn / 100000).toFixed(1)}L` : "—"}
            subtext={`${portfolio.returnPercent}% absolute`}
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            icon={Building2}
            label="Total Funds"
            value={hasData ? `${portfolio.totalFunds}` : "—"}
            subtext="Active schemes"
            color="#3b82f6"
            delay={0.2}
          />
          <StatCard
            icon={Building2}
            label="Total AMCs"
            value={hasData ? `${portfolio.totalAmcs}` : "—"}
            subtext="Fund houses"
            color="#06b6d4"
            delay={0.3}
          />
          <StatCard
            icon={AlertTriangle}
            label="Funds at Risk"
            value={hasData ? `${portfolio.fundsAtRisk}` : "—"}
            subtext="Need attention"
            color="#ef4444"
            delay={0.4}
          />
          <StatCard
            icon={Target}
            label="Risk Appetite"
            value={portfolio.riskAppetite}
            subtext="Your profile"
            color="#8b5cf6"
            delay={0.5}
          />
        </div>

        {/* ─── Charts Row ─────────────────────────────── */}
        {hasData && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Portfolio Value Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Portfolio Value Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={portfolio.monthlyData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff" }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Value"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Asset Allocation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <PieIcon className="w-5 h-5 text-emerald-400" />
                    Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={portfolio.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {portfolio.allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff" }}
                        formatter={(value: number) => [`${value}%`, ""]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {portfolio.allocation.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-400">{item.name} {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* ─── Top Holdings ───────────────────────────── */}
        {hasData && portfolio.topHoldings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Top Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.topHoldings.map((fund, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200 text-sm">{fund.name}</span>
                          <span className="text-sm font-semibold text-white">₹{(fund.value/100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${fund.percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-12">{fund.percent}%</span>
                          <Badge className={fund.return >= 0 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-xs" 
                            : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20 text-xs"
                          }>
                            {fund.return >= 0 ? "+" : ""}{fund.return}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Action Cards ───────────────────────────── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card 
              className="bg-slate-900/50 border-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-all group"
              onClick={() => router.push("/upload")}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <Upload className="w-6 h-6 text-emerald-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {hasData ? "Update Portfolio" : "Upload Portfolio"}
                </h3>
                <p className="text-sm text-slate-400">
                  {hasData 
                    ? "Upload new CAS statement to refresh your analysis" 
                    : "Upload your CAS PDF to get started"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              className="bg-slate-900/50 border-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-all group"
              onClick={() => router.push("/dashboard")}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white mb-1">Deep Analysis</h3>
                <p className="text-sm text-slate-400">
                  Detailed fund analysis, overlap detection, and AI recommendations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card 
              className="bg-slate-900/50 border-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-all group"
              onClick={() => router.push("/risk-profile")}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                    <Target className="w-6 h-6 text-amber-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white mb-1">Risk Profile</h3>
                <p className="text-sm text-slate-400">
                  Assess your risk appetite and get personalized allocation advice
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Risk Alert Banner ──────────────────────── */}
        {hasData && portfolio.fundsAtRisk > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6"
          >
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-200">
                    {portfolio.fundsAtRisk} fund{portfolio.fundsAtRisk > 1 ? "s" : ""} need attention
                  </p>
                  <p className="text-xs text-amber-300/70">
                    Some holdings are underperforming or carry higher risk. Review in Deep Analysis.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  onClick={() => router.push("/dashboard")}
                >
                  Review
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
