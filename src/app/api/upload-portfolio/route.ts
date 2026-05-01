import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Intelligent portfolio analysis engine
function analyzePortfolio(holdings: any[]) {
  const totalInvested = holdings.reduce((s, h) => s + (h.invested || 0), 0);
  const totalCurrent = holdings.reduce((s, h) => s + (h.current || 0), 0);
  const totalReturns = totalCurrent - totalInvested;
  const returnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  // Risk analysis
  const riskDistribution = {
    low: holdings.filter(h => h.risk === "Low").reduce((s, h) => s + h.allocation, 0),
    moderate: holdings.filter(h => h.risk === "Moderate").reduce((s, h) => s + h.allocation, 0),
    high: holdings.filter(h => h.risk === "High" || h.risk === "Very High").reduce((s, h) => s + h.allocation, 0),
  };

  // Category analysis
  const categoryBreakdown = holdings.reduce((acc: any, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.allocation;
    return acc;
  }, {});

  // Underperformers
  const underperformers = holdings
    .filter(h => h.returns < 8)
    .map(h => ({ name: h.name, returns: h.returns, category: h.category }));

  // Top performers
  const topPerformers = holdings
    .sort((a, b) => b.returns - a.returns)
    .slice(0, 3)
    .map(h => ({ name: h.name, returns: h.returns }));

  // Concentration risk
  const maxAllocation = Math.max(...holdings.map(h => h.allocation));
  const concentrationRisk = maxAllocation > 25 ? "High" : maxAllocation > 15 ? "Moderate" : "Low";

  // Health score (0-100)
  let healthScore = 70;
  if (riskDistribution.high < 30) healthScore += 10;
  if (concentrationRisk === "Low") healthScore += 10;
  if (returnsPercent > 15) healthScore += 10;
  if (underperformers.length === 0) healthScore += 10;
  healthScore = Math.min(100, healthScore);

  // AI Insights
  const insights = [];

  if (riskDistribution.high > 40) {
    insights.push({
      type: "warning",
      title: "High Risk Exposure",
      description: `${riskDistribution.high.toFixed(1)}% in high-risk funds. Consider adding balanced advantage or debt funds.`,
      action: "Rebalance Portfolio"
    });
  }

  if (concentrationRisk === "High") {
    insights.push({
      type: "critical",
      title: "Concentration Risk",
      description: `One fund is ${maxAllocation.toFixed(1)}% of portfolio. Diversify to reduce single-fund risk.`,
      action: "Diversify Now"
    });
  }

  if (underperformers.length > 0) {
    insights.push({
      type: "warning",
      title: `${underperformers.length} Fund(s) Underperforming`,
      description: `${underperformers.map(u => u.name).join(", ")} are below 8% returns. Consider reviewing or switching.`,
      action: "View Alternatives"
    });
  }

  // Tax optimization
  const elssFunds = holdings.filter(h => h.category === "ELSS");
  const elssInvested = elssFunds.reduce((s, h) => s + h.invested, 0);
  const section80CLimit = 150000;
  if (elssInvested < section80CLimit) {
    const remaining = section80CLimit - elssInvested;
    insights.push({
      type: "info",
      title: "Tax Saving Opportunity",
      description: `Invest ₹${remaining.toLocaleString("en-IN")} more in ELSS to save ~₹${(remaining * 0.3).toLocaleString("en-IN")} in taxes under Section 80C.`,
      action: "Explore ELSS"
    });
  }

  // SIP recommendation
  const totalSIP = holdings.reduce((s, h) => s + (h.sip || 0), 0);
  if (totalSIP < 20000) {
    insights.push({
      type: "info",
      title: "Increase SIP Discipline",
      description: `Current monthly SIP is ₹${totalSIP.toLocaleString("en-IN")}. Increase to ₹20K+ for better wealth accumulation.`,
      action: "Plan SIP"
    });
  }

  return {
    summary: {
      totalInvested,
      totalCurrent,
      totalReturns,
      returnsPercent,
      healthScore,
      fundCount: holdings.length,
      activeSIPs: holdings.filter(h => h.sip > 0).length,
      totalSIP,
    },
    riskAnalysis: riskDistribution,
    categoryBreakdown,
    underperformers,
    topPerformers,
    concentrationRisk,
    insights,
    recommendations: generateRecommendations(holdings, riskDistribution, categoryBreakdown)
  };
}

function generateRecommendations(holdings: any[], riskDist: any, categories: any) {
  const recs = [];

  // Rebalancing recommendations
  if (!categories["Large Cap"] || categories["Large Cap"] < 20) {
    recs.push("Increase Large Cap allocation to 20-25% for stability");
  }
  if (!categories["Debt"] && !categories["Liquid"]) {
    recs.push("Add 5-10% Liquid/Debt funds for emergency buffer");
  }
  if (categories["Small Cap"] > 15) {
    recs.push("Reduce Small Cap to under 15% to control volatility");
  }

  // Fund-specific recommendations
  const underperformers = holdings.filter(h => h.returns < 5 && h.risk !== "Low");
  if (underperformers.length > 0) {
    recs.push(`Consider switching ${underperformers.map(h => h.name).join(", ")} to better-performing alternatives`);
  }

  // Tax recommendations
  const hasELSS = holdings.some(h => h.category === "ELSS");
  if (!hasELSS) {
    recs.push("Start ELSS SIP for tax savings under Section 80C");
  }

  return recs;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userEmail = formData.get("email") as string;

    if (!file || !userEmail) {
      return NextResponse.json({ error: "File and email required" }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      return NextResponse.json({ error: "Invalid file type. Use PDF, Excel, or CSV" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const storagePath = `cas/${userEmail.replace(/[@.]/g, "_")}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolios")
      .upload(storagePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("portfolios").getPublicUrl(storagePath);

    // For demo: Parse based on file type (in production, use actual parser)
    let parsedHoldings = [];
    let analysis = null;

    // Simulate parsing for demo (in production, use pdf-parse or xlsx)
    if (fileName.includes("cas") || fileName.includes("portfolio")) {
      // Demo: Return sample data for testing
      parsedHoldings = [
        { name: "Axis Long Term Equity", category: "ELSS", invested: 120000, current: 145000, returns: 20.8, xirr: 12.5, rating: "B", risk: "High", sip: 10000, allocation: 26.2 },
        { name: "SBI Bluechip Fund", category: "Large Cap", invested: 80000, current: 95000, returns: 18.7, xirr: 11.2, rating: "A", risk: "Moderate", sip: 5000, allocation: 17.2 },
        { name: "Mirae Asset Emerging", category: "Mid Cap", invested: 60000, current: 78000, returns: 30.0, xirr: 18.3, rating: "A+", risk: "High", sip: 5000, allocation: 14.1 },
        { name: "Nippon India Small Cap", category: "Small Cap", invested: 50000, current: 52000, returns: 4.0, xirr: 2.5, rating: "C", risk: "Very High", sip: 3000, allocation: 9.4 },
        { name: "HDFC Balanced Advantage", category: "Balanced", invested: 45000, current: 51000, returns: 13.3, xirr: 8.7, rating: "A", risk: "Moderate", sip: 3000, allocation: 9.2 },
        { name: "ICICI Pru Liquid Fund", category: "Liquid", invested: 25000, current: 26200, returns: 4.8, xirr: 4.2, rating: "A", risk: "Low", sip: 0, allocation: 4.7 },
      ];

      analysis = analyzePortfolio(parsedHoldings);
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("portfolio_uploads")
      .insert({
        user_email: userEmail,
        file_name: file.name,
        file_url: publicUrl,
        file_type: fileName.endsWith(".pdf") ? "pdf" : "excel",
        status: parsedHoldings.length > 0 ? "analyzed" : "uploaded",
        parsed_data: parsedHoldings.length > 0 ? parsedHoldings : null,
        analysis: analysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      message: parsedHoldings.length > 0 ? "Portfolio analyzed successfully!" : "Portfolio uploaded! Analysis in progress...",
      uploadId: dbData.id,
      fileUrl: publicUrl,
      holdings: parsedHoldings,
      analysis: analysis,
      nextStep: parsedHoldings.length > 0 ? "View your dashboard" : "Wait for AI analysis"
    });

  } catch (error: any) {
    console.error("Upload/Analysis error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
