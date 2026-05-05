"use client";

import { useState } from "react";
import { MessageSquare,  
  Target, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  GraduationCap, Building, Shield, PiggyBank, Plane, Heart, ChevronRight,
  TrendingUp, AlertCircle, CheckCircle, Plus, X, Edit3
} from "lucide-react";
import Link from "next/link";

const defaultGoals = [
  {
    id: 1,
    name: "Child Education",
    icon: GraduationCap,
    targetAmount: 5000000,
    currentAmount: 1250000,
    timeline: 12,
    color: "blue",
    linkedFunds: ["Axis ELSS Tax Saver", "Parag Parikh Flexi Cap"],
    monthlySIP: 15000,
    gap: 8500,
    onTrack: false
  },
  {
    id: 2,
    name: "Retirement Corpus",
    icon: Shield,
    targetAmount: 50000000,
    currentAmount: 5532843,
    timeline: 20,
    color: "green",
    linkedFunds: ["Invesco India Gold ETF", "Nippon India Small Cap", "Kotak Arbitrage Fund"],
    monthlySIP: 45500,
    gap: 0,
    onTrack: true
  },
  {
    id: 3,
    name: "Dream Home",
    icon: Building,
    targetAmount: 15000000,
    currentAmount: 2100000,
    timeline: 8,
    color: "purple",
    linkedFunds: ["Axis Multicap Fund", "ICICI Pru ELSS"],
    monthlySIP: 25000,
    gap: 12000,
    onTrack: false
  },
  {
    id: 4,
    name: "Emergency Fund",
    icon: Heart,
    targetAmount: 2000000,
    currentAmount: 1800000,
    timeline: 1,
    color: "red",
    linkedFunds: ["Kotak Arbitrage Fund", "Invesco India Arbitrage"],
    monthlySIP: 0,
    gap: 0,
    onTrack: true
  }
];

const allFunds = [
  "Invesco India Gold ETF FoF", "Parag Parikh Flexi Cap", "Nippon India Small Cap",
  "Kotak Arbitrage Fund", "PGIM India Flexi Cap", "Invesco India Arbitrage",
  "ICICI Pru ELSS Tax Saver", "HDFC Flexi Cap Fund", "Invesco India Infrastructure",
  "Axis Multicap Fund", "ICICI Pru Technology", "Mirae Asset ELSS",
  "Axis ELSS Tax Saver", "Mirae Asset Large & Midcap", "Invesco India Smallcap",
  "Nippon India Multi Cap", "Canara Robeco ELSS"
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(defaultGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof defaultGoals[0] | null>(null);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalSIP = goals.reduce((s, g) => s + g.monthlySIP, 0);
  const totalGap = goals.reduce((s, g) => s + g.gap, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain },
  ];

  const getProgress = (current: number, target: number) => Math.min((current / target) * 100, 100);

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">Goal-Based SIP Planner</h1>
          </div>
          <p className="text-slate-600">Link your investments to life goals and track your progress</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <Target className="w-6 h-6 text-blue-600 mb-3" />
            <p className="text-2xl font-bold text-slate-900">₹{(totalTarget/10000000).toFixed(1)}Cr</p>
            <p className="text-sm text-slate-500">Total Goals Target</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <TrendingUp className="w-6 h-6 text-green-600 mb-3" />
            <p className="text-2xl font-bold text-green-600">₹{(totalCurrent/100000).toFixed(1)}L</p>
            <p className="text-sm text-slate-500">Current Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <PiggyBank className="w-6 h-6 text-purple-600 mb-3" />
            <p className="text-2xl font-bold text-purple-600">₹{totalSIP.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Monthly SIP Committed</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <AlertCircle className="w-6 h-6 text-red-600 mb-3" />
            <p className="text-2xl font-bold text-red-600">₹{totalGap.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Monthly SIP Gap</p>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const progress = getProgress(goal.currentAmount, goal.targetAmount);
            return (
              <div 
                key={goal.id} 
                onClick={() => setSelectedGoal(goal)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${goal.color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${goal.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                      <p className="text-sm text-slate-500">{goal.timeline} years to go</p>
                    </div>
                  </div>
                  {goal.onTrack ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> On Track
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Needs Attention
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">₹{(goal.currentAmount/100000).toFixed(1)}L of ₹{(goal.targetAmount/100000).toFixed(1)}L</span>
                    <span className="font-semibold text-slate-900">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${goal.onTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-500">Monthly SIP</p>
                    <p className="font-semibold text-slate-900">₹{goal.monthlySIP.toLocaleString()}</p>
                  </div>
                  {!goal.onTrack && (
                    <div className="text-right">
                      <p className="text-red-500">Gap</p>
                      <p className="font-semibold text-red-600">+₹{goal.gap.toLocaleString()}/mo</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-slate-500">Linked Funds</p>
                    <p className="font-semibold text-slate-900">{goal.linkedFunds.length}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Goal Card */}
          <button 
            onClick={() => setShowAddGoal(true)}
            className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-colors min-h-[200px]"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-slate-600">Add New Goal</span>
          </button>
        </div>

        {/* SIP Gap Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            SIP Gap Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Goal</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Target</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Current SIP</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Required SIP</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Gap</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => {
                  const requiredSIP = goal.monthlySIP + goal.gap;
                  return (
                    <tr key={goal.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{goal.name}</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{(goal.targetAmount/100000).toFixed(1)}L</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{goal.monthlySIP.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{requiredSIP.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        {goal.gap > 0 ? (
                          <span className="text-red-600 font-semibold">+₹{goal.gap.toLocaleString()}</span>
                        ) : (
                          <span className="text-green-600 font-semibold">✓</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {goal.onTrack ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">On Track</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Increase SIP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {totalGap > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Increase SIP by ₹{totalGap.toLocaleString()}/month to meet all goals</p>
                  <p className="text-sm text-amber-700">Consider redirecting SIP from underperforming funds</p>
                </div>
              </div>
              <Link href="/rebalance" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                Optimize SIP
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedGoal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${selectedGoal.color}-100 rounded-lg flex items-center justify-center`}>
                  <selectedGoal.icon className={`w-5 h-5 text-${selectedGoal.color}-600`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedGoal.name}</h3>
                  <p className="text-sm text-slate-500">{selectedGoal.timeline} years remaining</p>
                </div>
              </div>
              <button onClick={() => setSelectedGoal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Target</p>
                  <p className="text-xl font-bold text-slate-900">₹{(selectedGoal.targetAmount/100000).toFixed(1)}L</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Current</p>
                  <p className="text-xl font-bold text-green-600">₹{(selectedGoal.currentAmount/100000).toFixed(1)}L</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">{getProgress(selectedGoal.currentAmount, selectedGoal.targetAmount).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${selectedGoal.onTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${getProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Linked Funds</h4>
                <div className="space-y-2">
                  {selectedGoal.linkedFunds.map(fund => (
                    <div key={fund} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-900">{fund}</span>
                      <Link href="/dashboard" className="text-xs text-blue-600 hover:text-blue-700">View →</Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Monthly SIP</p>
                  <p className="text-lg font-bold text-blue-600">₹{selectedGoal.monthlySIP.toLocaleString()}</p>
                </div>
                {!selectedGoal.onTrack && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">SIP Gap</p>
                    <p className="text-lg font-bold text-red-600">+₹{selectedGoal.gap.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Increase SIP
                </button>
                <button 
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


