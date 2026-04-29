// components/dashboard/summary-cards.tsx
"use client";

import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { PortfolioSummary } from "@/types/portfolio";

export default function SummaryCards({ summary }: { summary: PortfolioSummary }) {
  const isPositive = summary.total_absolute_returns >= 0;
  const dayPositive = summary.day_change_value >= 0;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Portfolio Overview</h1>
          <p className="text-text-secondary text-sm mt-1">
            {summary.total_funds} funds • Updated today
          </p>
        </div>
        <div className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          ${dayPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
        `}>
          {dayPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {dayPositive ? '+' : ''}{summary.day_change_value.toFixed(0)} today
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Value */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-accent" />
            <span className="metric-label">Current Value</span>
          </div>
          <p className="metric-value">{formatCurrency(summary.total_current_value)}</p>
          <div className={`metric-change ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{summary.total_absolute_returns.toFixed(2)}% all time
          </div>
        </div>

        {/* Invested Amount */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-text-secondary" />
            <span className="metric-label">Invested</span>
          </div>
          <p className="metric-value text-text-secondary">{formatCurrency(summary.total_invested)}</p>
          <p className="text-xs text-text-muted mt-1">
            {formatCurrency(summary.total_current_value - summary.total_invested)} {isPositive ? 'gain' : 'loss'}
          </p>
        </div>

        {/* XIRR */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="metric-label">XIRR (Annualized)</span>
          </div>
          <p className="metric-value text-success">{summary.total_xirr.toFixed(2)}%</p>
          <p className="text-xs text-text-muted mt-1">
            Post-tax: {summary.post_tax_xirr.toFixed(2)}%
          </p>
        </div>

        {/* Tax Impact */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-warning" />
            <span className="metric-label">Tax Liability</span>
          </div>
          <p className="metric-value text-warning">{formatCurrency(summary.total_tax_liability)}</p>
          <p className="text-xs text-text-muted mt-1">
            If sold today
          </p>
        </div>
      </div>
    </div>
  );
}
