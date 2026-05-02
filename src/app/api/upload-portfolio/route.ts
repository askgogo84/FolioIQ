import { NextRequest, NextResponse } from "next/server";

// Portfolio analysis engine (no external dependencies)
function analyzePortfolio(holdings: any[]) {
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.current, 0);
  const totalReturns = totalCurrent - totalInvested;
  const returnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const riskDistribution = {
    low: holdings.filter(h => h.risk === "Low").reduce((s, h) => s + h.allocation, 0),
    moderate: holdings.filter(h => h.risk === "Moderate").reduce((s, h) => s + h.allocation, 0),
    high: holdings.filter(h => h.risk === "High" || h.risk === "Very High").reduce((s, h) => s + h.allocation, 0),
  };

  const categoryBreakdown = holdings.reduce((acc: any, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.allocation;
    return acc;
  }, {});

  const underperformers = holdings.filter(h => h.returns < 8);
  const topPerformers = [...holdings].sort((a, b) => b.returns - a.returns).slice(0, 3);

  const maxAllocation = Math.max(...holdings.map(h => h.allocation));
  const concentrationRisk = maxAllocation > 25 ? "High" : maxAllocation > 15 ? "Moderate" : "Low";

  let healthScore = 70;
  if (riskDistribution.high < 30) healthScore += 10;
  if (concentrationRisk === "Low") healthScore += 10;
  if (returnsPercent > 15) healthScore += 10;
  if (underperformers.length === 0) healthScore += 10;
  healthScore = Math.min(100, healthScore);

  const insights = [];

  if (riskDistribution.high > 40) {
    insights.push({ type: "warning", title: "High Risk Exposure", description: `${riskDistribution.high.toFixed(1)}% in high-risk funds. Consider adding balanced advantage or debt funds.`, action: "Rebalance Portfolio" });
  }

  if (concentrationRisk === "High") {
    insights.push({ type: "critical", title: "Concentration Risk", description: `One fund is ${maxAllocation.toFixed(1)}% of portfolio. Diversify to reduce single-fund risk.`, action: "Diversify Now" });
  }

  if (underperformers.length > 0) {
    insights.push({ type: "warning", title: `${underperformers.length} Fund(s) Underperforming`, description: `${underperformers.slice(0, 3).map(u => u.name).join(", ")} are below 8% returns.`, action: "View Alternatives" });
  }

  const elssFunds = holdings.filter(h => h.category === "ELSS");
  const elssInvested = elssFunds.reduce((s, h) => s + h.invested, 0);
  if (elssInvested < 150000) {
    const remaining = 150000 - elssInvested;
    insights.push({ type: "info", title: "Tax Saving Opportunity", description: `Invest ₹${remaining.toLocaleString("en-IN")} more in ELSS to save ~₹${(remaining * 0.3).toLocaleString("en-IN")} in taxes.`, action: "Explore ELSS" });
  }

  const totalSIP = holdings.reduce((s, h) => s + (h.sip || 0), 0);
  if (totalSIP < 20000) {
    insights.push({ type: "info", title: "Increase SIP Discipline", description: `Current monthly SIP is ₹${totalSIP.toLocaleString("en-IN")}. Increase to ₹20K+ for better wealth accumulation.`, action: "Plan SIP" });
  }

  const recommendations = [];
  if (!categoryBreakdown["Large Cap"] || categoryBreakdown["Large Cap"] < 20) recommendations.push("Increase Large Cap allocation to 20-25% for stability");
  if (!categoryBreakdown["Debt"] && !categoryBreakdown["Liquid"] && !categoryBreakdown["Arbitrage"]) recommendations.push("Add 5-10% Liquid/Arbitrage funds for emergency buffer");
  if (categoryBreakdown["Small Cap"] > 15) recommendations.push("Reduce Small Cap to under 15% to control volatility");

  return {
    summary: { totalInvested, totalCurrent, totalReturns, returnsPercent, healthScore, fundCount: holdings.length, activeSIPs: holdings.filter(h => h.sip > 0).length, totalSIP },
    riskAnalysis: riskDistribution,
    categoryBreakdown,
    underperformers,
    topPerformers,
    concentrationRisk,
    insights,
    recommendations
  };
}

// Demo portfolio data based on user's CAS
const DEMO_PORTFOLIO = [
  { name: "Axis ELSS Tax Saver", category: "ELSS", invested: 42411, current: 155248, returns: 11.76, xirr: 11.8, rating: "B", risk: "High", sip: 5000, allocation: 2.8 },
  { name: "Axis Multicap Fund", category: "Multi Cap", invested: 102799, current: 215804, returns: 21.21, xirr: 21.2, rating: "A", risk: "High", sip: 0, allocation: 3.9 },
  { name: "Axis Small Cap Fund", category: "Small Cap", invested: 155251, current: 240792, returns: 13.95, xirr: 14.0, rating: "B", risk: "Very High", sip: 5000, allocation: 4.4 },
  { name: "Canara Robeco ELSS", category: "ELSS", invested: 59997, current: 89892, returns: 11.85, xirr: 11.9, rating: "A", risk: "High", sip: 10000, allocation: 1.6 },
  { name: "HDFC Flexi Cap Fund", category: "Flexi Cap", invested: 259987, current: 263243, returns: 4.80, xirr: 4.8, rating: "A", risk: "High", sip: 10000, allocation: 4.8 },
  { name: "ICICI Pru ELSS", category: "ELSS", invested: 65135, current: 277738, returns: 12.89, xirr: 12.9, rating: "A", risk: "High", sip: 0, allocation: 5.0 },
  { name: "ICICI Pru Technology", category: "Sectoral", invested: 239988, current: 206018, returns: -14.15, xirr: -14.2, rating: "C", risk: "Very High", sip: 10000, allocation: 3.7 },
  { name: "Invesco Arbitrage", category: "Arbitrage", invested: 299985, current: 341109, returns: 6.65, xirr: 6.7, rating: "A", risk: "Low", sip: 0, allocation: 6.2 },
  { name: "Invesco Gold ETF", category: "Gold/ETF", invested: 329984, current: 723777, returns: 34.69, xirr: 34.7, rating: "A+", risk: "Moderate", sip: 5500, allocation: 13.1 },
  { name: "Invesco Infrastructure", category: "Sectoral", invested: 239988, current: 249814, returns: 3.99, xirr: 4.0, rating: "B", risk: "Very High", sip: 10000, allocation: 4.5 },
  { name: "Invesco Smallcap", category: "Small Cap", invested: 109995, current: 111087, returns: 2.09, xirr: 2.1, rating: "B", risk: "Very High", sip: 10000, allocation: 2.0 },
  { name: "Kotak Arbitrage", category: "Arbitrage", invested: 399980, current: 455000, returns: 6.68, xirr: 6.7, rating: "A", risk: "Low", sip: 0, allocation: 8.2 },
  { name: "Mirae Asset ELSS", category: "ELSS", invested: 119994, current: 188623, returns: 11.65, xirr: 11.7, rating: "A", risk: "High", sip: 10000, allocation: 3.4 },
  { name: "Mirae Large & Midcap", category: "Large & Mid", invested: 119994, current: 122893, returns: 2.34, xirr: 2.3, rating: "B", risk: "High", sip: 5000, allocation: 2.2 },
  { name: "Nippon Multi Cap", category: "Multi Cap", invested: 109995, current: 109671, returns: -0.62, xirr: -0.6, rating: "C", risk: "High", sip: 10000, allocation: 2.0 },
  { name: "Nippon Small Cap", category: "Small Cap", invested: 361249, current: 522495, returns: 16.47, xirr: 16.5, rating: "A", risk: "Very High", sip: 10000, allocation: 9.4 },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", invested: 374467, current: 633035, returns: 16.81, xirr: 16.8, rating: "A+", risk: "High", sip: 10000, allocation: 11.4 },
  { name: "PGIM Flexi Cap", category: "Flexi Cap", invested: 339983, current: 361022, returns: 4.06, xirr: 4.1, rating: "A", risk: "High", sip: 10000, allocation: 6.5 },
  { name: "SBI Small Cap", category: "Small Cap", invested: 179991, current: 265585, returns: 11.43, xirr: 11.4, rating: "A", risk: "Very High", sip: 5000, allocation: 4.8 },
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userEmail = formData.get("email") as string;

    if (!file || !userEmail) {
      return NextResponse.json({ error: "File and email required" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      return NextResponse.json({ error: "Invalid file type. Use PDF, Excel, or CSV" }, { status: 400 });
    }

    // For now, return demo portfolio data
    // In production, this would parse the actual file
    const holdings = DEMO_PORTFOLIO;
    const analysis = analyzePortfolio(holdings);

    return NextResponse.json({
      success: true,
      message: "Portfolio analyzed successfully!",
      holdings: holdings,
      analysis: analysis,
      nextStep: "View your dashboard"
    });

  } catch (error: any) {
    console.error("Upload/Analysis error:", error);
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}
