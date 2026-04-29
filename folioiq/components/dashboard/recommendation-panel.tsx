// components/dashboard/recommendation-panel.tsx
"use client";

import { PlayCircle, PauseCircle, StopCircle, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import type { FundHolding } from "@/types/portfolio";

export default function RecommendationPanel({ holdings }: { holdings: FundHolding[] }) {
  const continues = holdings.filter(h => h.recommendation === 'CONTINUE');
  const pauses = holdings.filter(h => h.recommendation === 'PAUSE');
  const stops = holdings.filter(h => h.recommendation === 'STOP');
  const reviews = holdings.filter(h => h.recommendation === 'REVIEW');

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-text-primary">AI Recommendations</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-success/5 border border-success/10">
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">{continues.length} Continue</span>
          </div>
          <p className="text-xs text-text-secondary">{formatCurrency(continues.reduce((s, h) => s + h.current_value, 0))}</p>
        </div>

        <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
          <div className="flex items-center gap-2 mb-1">
            <PauseCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">{pauses.length} Pause</span>
          </div>
          <p className="text-xs text-text-secondary">{formatCurrency(pauses.reduce((s, h) => s + h.current_value, 0))}</p>
        </div>

        <div className="p-3 rounded-lg bg-danger/5 border border-danger/10">
          <div className="flex items-center gap-2 mb-1">
            <StopCircle className="w-4 h-4 text-danger" />
            <span className="text-sm font-medium text-danger">{stops.length} Stop</span>
          </div>
          <p className="text-xs text-text-secondary">{formatCurrency(stops.reduce((s, h) => s + h.current_value, 0))}</p>
        </div>

        <div className="p-3 rounded-lg bg-info/5 border border-info/10">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-info" />
            <span className="text-sm font-medium text-info">{reviews.length} Review</span>
          </div>
          <p className="text-xs text-text-secondary">{formatCurrency(reviews.reduce((s, h) => s + h.current_value, 0))}</p>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Priority Actions</h3>

        {stops.length > 0 && (
          <div className="p-4 rounded-lg bg-danger/5 border border-danger/10">
            <div className="flex items-start gap-3">
              <StopCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-danger text-sm">Consider Exiting</p>
                <p className="text-xs text-text-secondary mt-1">
                  {stops.length} fund{stops.length > 1 ? 's' : ''} underperforming peers by &gt;5% annually. 
                  Potential tax savings: {formatCurrency(stops.reduce((s, h) => s + h.ltcg_tax, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {pauses.length > 0 && (
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
            <div className="flex items-start gap-3">
              <PauseCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning text-sm">Pause New SIPs</p>
                <p className="text-xs text-text-secondary mt-1">
                  {pauses.length} fund{pauses.length > 1 ? 's' : ''} showing style drift or expense ratio hikes.
                  Review in 3 months.
                </p>
              </div>
            </div>
          </div>
        )}

        {continues.length > 0 && (
          <div className="p-4 rounded-lg bg-success/5 border border-success/10">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-success text-sm">Top Performers</p>
                <p className="text-xs text-text-secondary mt-1">
                  {continues.length} fund{continues.length > 1 ? 's' : ''} beating category average. 
                  Continue SIPs to benefit from rupee cost averaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tax Loss Harvesting Opportunity */}
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-accent text-sm">Tax-Loss Harvesting</p>
              <p className="text-xs text-text-secondary mt-1">
                Sell losing funds before FY end to offset up to ₹1L in LTCG gains. 
                Potential savings: ₹10,400 in taxes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
