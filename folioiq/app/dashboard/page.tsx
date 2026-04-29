// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard-shell";
import SummaryCards from "@/components/dashboard/summary-cards";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import HoldingsTable from "@/components/dashboard/holdings-table";
import RecommendationPanel from "@/components/dashboard/recommendation-panel";
import TaxImpactCard from "@/components/dashboard/tax-impact-card";
import type { FundHolding, PortfolioSummary } from "@/types/portfolio";

async function getPortfolioData(userId: string) {
  const supabase = await createClient();

  const { data: holdings, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", userId)
    .order("current_value", { ascending: false });

  if (error || !holdings || holdings.length === 0) {
    return null;
  }

  const summary: PortfolioSummary = {
    total_invested: holdings.reduce((sum, h) => sum + h.invested_value, 0),
    total_current_value: holdings.reduce((sum, h) => sum + h.current_value, 0),
    total_absolute_returns: 0,
    total_xirr: holdings.reduce((sum, h) => sum + h.xirr * h.current_value, 0) / holdings.reduce((sum, h) => sum + h.current_value, 0),
    total_stcg_tax: holdings.reduce((sum, h) => sum + h.stcg_tax, 0),
    total_ltcg_tax: holdings.reduce((sum, h) => sum + h.ltcg_tax, 0),
    total_tax_liability: 0,
    post_tax_value: 0,
    post_tax_xirr: 0,
    equity_allocation: 0,
    debt_allocation: 0,
    hybrid_allocation: 0,
    other_allocation: 0,
    total_funds: holdings.length,
    continue_count: holdings.filter(h => h.recommendation === 'CONTINUE').length,
    pause_count: holdings.filter(h => h.recommendation === 'PAUSE').length,
    stop_count: holdings.filter(h => h.recommendation === 'STOP').length,
    review_count: holdings.filter(h => h.recommendation === 'REVIEW').length,
    day_change_value: holdings.reduce((sum, h) => sum + (h.current_value - (h.current_value / (1 + h.absolute_returns / 100))), 0),
    day_change_percent: 0,
  };

  summary.total_absolute_returns = ((summary.total_current_value - summary.total_invested) / summary.total_invested) * 100;
  summary.total_tax_liability = summary.total_stcg_tax + summary.total_ltcg_tax;
  summary.post_tax_value = summary.total_current_value - summary.total_tax_liability;
  summary.post_tax_xirr = summary.total_xirr * 0.85;

  const totalValue = summary.total_current_value;
  summary.equity_allocation = (holdings.filter(h => h.category.includes('Equity')).reduce((s, h) => s + h.current_value, 0) / totalValue) * 100;
  summary.debt_allocation = (holdings.filter(h => h.category.includes('Debt')).reduce((s, h) => s + h.current_value, 0) / totalValue) * 100;
  summary.hybrid_allocation = (holdings.filter(h => h.category.includes('Hybrid')).reduce((s, h) => s + h.current_value, 0) / totalValue) * 100;
  summary.other_allocation = 100 - summary.equity_allocation - summary.debt_allocation - summary.hybrid_allocation;

  return { holdings: holdings as FundHolding[], summary };
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const data = await getPortfolioData(userId);

  if (!data) {
    redirect("/upload");
  }

  const { holdings, summary } = data;

  return (
    <DashboardShell>
      <div className="space-y-8">
        <SummaryCards summary={summary} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PortfolioChart 
              equity={summary.equity_allocation} 
              debt={summary.debt_allocation} 
              hybrid={summary.hybrid_allocation} 
              other={summary.other_allocation}
            />
            <HoldingsTable holdings={holdings} />
          </div>

          <div className="space-y-8">
            <RecommendationPanel holdings={holdings} />
            <TaxImpactCard summary={summary} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
