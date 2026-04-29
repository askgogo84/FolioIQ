// components/dashboard/tax-impact-card.tsx
"use client";

import { Receipt, ArrowRight, Info } from "lucide-react";
import type { PortfolioSummary } from "@/types/portfolio";

export default function TaxImpactCard({ summary }: { summary: PortfolioSummary }) {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const taxEfficiency = ((summary.post_tax_value / summary.total_current_value) * 100).toFixed(1);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="w-5 h-5 text-warning" />
        <h2 className="text-lg font-semibold text-text-primary">Tax Impact</h2>
      </div>

      {/* Tax Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Current Value</span>
          <span className="font-medium text-text-primary">{formatCurrency(summary.total_current_value)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">STCG Tax (15%)</span>
          <span className="font-medium text-danger">-{formatCurrency(summary.total_stcg_tax)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">LTCG Tax (10%)</span>
          <span className="font-medium text-danger">-{formatCurrency(summary.total_ltcg_tax)}</span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="font-medium text-text-primary">Post-Tax Value</span>
          <span className="font-bold text-success text-lg">{formatCurrency(summary.post_tax_value)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Post-Tax XIRR</span>
          <span className="font-medium text-success">{summary.post_tax_xirr.toFixed(2)}%</span>
        </div>
      </div>

      {/* Tax Efficiency Meter */}
      <div className="mt-6 p-4 rounded-lg bg-surface-elevated">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">Tax Efficiency</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success to-accent rounded-full transition-all duration-1000"
              style={{ width: `${taxEfficiency}%` }}
            />
          </div>
          <span className="text-sm font-bold text-accent">{taxEfficiency}%</span>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Higher is better. Debt funds with indexation can improve this score.
        </p>
      </div>

      {/* Tax Tips */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            Hold equity funds &gt;1 year to save 15% in STCG tax
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            First ₹1L LTCG is tax-free — plan redemptions accordingly
          </span>
        </div>
      </div>
    </div>
  );
}
