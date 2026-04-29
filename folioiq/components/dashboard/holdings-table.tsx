// components/dashboard/holdings-table.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, PauseCircle, StopCircle, PlayCircle, HelpCircle } from "lucide-react";
import type { FundHolding } from "@/types/portfolio";

export default function HoldingsTable({ holdings }: { holdings: FundHolding[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'returns' | 'score'>('value');

  const sortedHoldings = [...holdings].sort((a, b) => {
    if (sortBy === 'value') return b.current_value - a.current_value;
    if (sortBy === 'returns') return b.xirr - a.xirr;
    return b.fund_score - a.fund_score;
  });

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusIcon = (rec: string) => {
    switch (rec) {
      case 'CONTINUE': return <PlayCircle className="w-5 h-5 text-success" />;
      case 'PAUSE': return <PauseCircle className="w-5 h-5 text-warning" />;
      case 'STOP': return <StopCircle className="w-5 h-5 text-danger" />;
      default: return <HelpCircle className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusClass = (rec: string) => {
    switch (rec) {
      case 'CONTINUE': return 'status-continue';
      case 'PAUSE': return 'status-pause';
      case 'STOP': return 'status-stop';
      default: return 'bg-text-muted';
    }
  };

  const getStatusBadge = (rec: string) => {
    switch (rec) {
      case 'CONTINUE': return 'badge-success';
      case 'PAUSE': return 'badge-warning';
      case 'STOP': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Your Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="value">Value</option>
              <option value="returns">Returns</option>
              <option value="score">Fund Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {sortedHoldings.map((holding) => (
          <div key={holding.id} className="group">
            {/* Main Row */}
            <div 
              className="fund-row cursor-pointer"
              onClick={() => setExpandedId(expandedId === holding.id ? null : holding.id)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={getStatusClass(holding.recommendation)} />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{holding.scheme_name}</p>
                  <p className="text-xs text-text-secondary">{holding.category} • {holding.amc}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-text-primary">{formatCurrency(holding.current_value)}</p>
                  <p className="text-xs text-text-secondary">{formatCurrency(holding.invested_value)} invested</p>
                </div>

                <div className="text-right hidden md:block">
                  <p className={`font-medium flex items-center justify-end gap-1 ${holding.xirr >= 0 ? 'text-success' : 'text-danger'}`}>
                    {holding.xirr >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {holding.xirr.toFixed(2)}%
                  </p>
                  <p className="text-xs text-text-secondary">XIRR</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(holding.recommendation)}>
                    {holding.recommendation}
                  </span>
                  {expandedId === holding.id ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === holding.id && (
              <div className="px-4 pb-4 bg-surface-elevated/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Units</p>
                    <p className="font-medium text-text-primary">{holding.units.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Current NAV</p>
                    <p className="font-medium text-text-primary">₹{holding.nav.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Expense Ratio</p>
                    <p className="font-medium text-text-primary">{holding.expense_ratio}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Fund Score</p>
                    <p className="font-medium text-accent">{holding.fund_score}/100</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Gain Type</p>
                    <p className={`font-medium ${holding.gain_type === 'LTCG' ? 'text-success' : holding.gain_type === 'STCG' ? 'text-warning' : 'text-text-secondary'}`}>
                      {holding.gain_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Tax if Sold</p>
                    <p className="font-medium text-danger">₹{(holding.stcg_tax + holding.ltcg_tax).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Post-Tax Value</p>
                    <p className="font-medium text-success">{formatCurrency(holding.post_tax_value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Risk (Beta)</p>
                    <p className="font-medium text-text-primary">{holding.beta.toFixed(2)}</p>
                  </div>
                </div>

                {/* Recommendation Reason */}
                <div className="mt-4 p-3 rounded-lg bg-white border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(holding.recommendation)}
                    <span className="font-medium text-text-primary">Why {holding.recommendation}?</span>
                  </div>
                  <ul className="space-y-1">
                    {holding.recommendation_reason.map((reason, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
