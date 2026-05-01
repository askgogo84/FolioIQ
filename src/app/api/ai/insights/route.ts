import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let requestType = "insights";
  let portfolio = {};
  
  try {
    const body = await request.json();
    requestType = body.requestType || "insights";
    portfolio = body.portfolio || {};

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: getFallbackData(requestType, portfolio),
        fallback: true,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: getSystemPrompt(requestType),
        messages: [{ role: "user", content: getUserPrompt(requestType, portfolio) }],
      }),
    });

    if (!response.ok) {
      throw new Error("Claude API error: " + response.status);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || "";

    let parsedData;
    try {
      const jsonMatch = content.match(/`json\n?([\s\S]*?)\n?`/) || 
                        content.match(/\[[\s\S]*\]/) ||
                        content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsedData = { rawResponse: content };
      }
    } catch (e) {
      parsedData = { rawResponse: content };
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      rawResponse: content,
    });

  } catch (error) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({
      success: true,
      data: getFallbackData(requestType, portfolio),
      fallback: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function getSystemPrompt(requestType: string): string {
  switch (requestType) {
    case "insights":
      return "You are FolioIQ, an expert mutual fund analyst. Analyze portfolios and provide 3-4 actionable insights in JSON format.";
    case "recommendations":
      return "You are FolioIQ AI. Provide 2-3 fund recommendations in JSON format.";
    case "chat":
      return "You are FolioIQ AI, a friendly mutual fund expert. Answer questions about portfolios, market trends, tax planning.";
    default:
      return "You are a helpful mutual fund advisor.";
  }
}

function getUserPrompt(requestType: string, portfolio: any): string {
  if (requestType === "chat") {
    return portfolio.message || "Analyze my portfolio";
  }
  return "Analyze this portfolio and provide insights in JSON format.";
}

function getFallbackData(requestType: string, portfolio: any) {
  switch (requestType) {
    case "insights":
      return [
        { id: "1", type: "critical", title: "Small Cap Overexposure", description: "Your small cap allocation is 28% of equity, recommended max is 15%.", action: "Rebalance to Large/Mid Cap", impact: "-15% risk reduction" },
        { id: "2", type: "info", title: "ELSS Limit Not Utilized", description: "You have invested only Rs.1.2L in ELSS. Max limit is Rs.1.5L under Section 80C.", action: "Increase ELSS SIP by Rs.2.5K", impact: "+Rs.30K annual tax savings" },
        { id: "3", type: "warning", title: "Axis Long Term Underperforming", description: "3-year XIRR is 12.5% vs category average 15.2%.", action: "View Alternatives", impact: "+8-12% potential returns" },
        { id: "4", type: "success", title: "SIP Discipline Strong", description: "You have maintained 6 active SIPs for 18+ months.", action: "Continue Strategy", impact: "Wealth compounding on track" },
      ];
    case "recommendations":
      return [
        { id: "r1", type: "switch", fromFund: "Axis Long Term Equity", toFund: "Quant ELSS Fund", reason: "Quant ELSS has outperformed Axis by 4.2% CAGR over 5 years.", potentialReturn: "+4.2% CAGR", riskLevel: "Moderate", confidence: 87 },
        { id: "r2", type: "add", category: "International Equity", reason: "Zero international exposure. Adding 10% can reduce portfolio correlation.", potentialReturn: "+12% diversification benefit", riskLevel: "Moderate-High", confidence: 92 },
        { id: "r3", type: "reduce", category: "Small Cap", reason: "Current 28% allocation exceeds recommended 15%.", potentialReturn: "-15% volatility", riskLevel: "Low", confidence: 95 },
      ];
    default:
      return { message: "AI analysis completed" };
  }
}
