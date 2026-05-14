import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client - bypasses RLS for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT anon key!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId required" },
        { status: 400 }
      );
    }

    // 1. Parse the CAS file (your existing parser)
    const parsedData = await parseCASFile(file);
    
    console.log("? Parsed funds:", (parsedData as any)?.funds?.length || 0);

    // 2. Prepare portfolio record with CORRECT structure
    const portfolioRecord = {
      user_id: userId,
      portfolio_name: parsedData.portfolioName || "My Portfolio",
      total_value: parsedData.totalValue || 0,
      invested_amount: parsedData.investedAmount || 0,
      current_returns: parsedData.currentReturns || 0,
      xirr: parsedData.xirr || 0,
      fund_count: (parsedData as any)?.funds?.length || 0,
      funds: parsedData.funds || [], // Array of fund objects
      monthly_sip: parsedData.monthlySip || 0,
      sip_count: parsedData.sipCount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 3. Delete old portfolio for this user (prevent duplicates)
    await supabaseAdmin
      .from("portfolios")
      .delete()
      .eq("user_id", userId);

    // 4. Insert new portfolio with service role (bypasses RLS)
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("portfolios")
      .insert([portfolioRecord])
      .select()
      .single();

    if (insertError) {
      console.error("? Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save portfolio", details: insertError.message },
        { status: 500 }
      );
    }

    console.log("? Saved to Supabase:", inserted.id);

    // 5. Also save individual fund records for detailed queries
    if (parsedData.funds?.length > 0) {
      const fundRecords = parsedData.funds.map((fund: any, index: number) => ({
        user_id: userId,
        portfolio_id: inserted.id,
        fund_name: fund.name || fund.fundName || `Fund ${index + 1}`,
        amc: fund.amc || "Unknown",
        category: fund.category || "Unknown",
        units: fund.units || 0,
        nav: fund.nav || 0,
        current_value: fund.currentValue || (fund.units * fund.nav) || 0,
        invested_value: fund.investedValue || 0,
        returns: fund.returns || 0,
        xirr: fund.xirr || 0,
        folio_number: fund.folioNumber || "",
        isin: fund.isin || "",
        created_at: new Date().toISOString()
      }));

      const { error: fundsError } = await supabaseAdmin
        .from("fund_holdings")
        .insert(fundRecords);

      if (fundsError) {
        console.error("? Fund holdings insert error:", fundsError);
      }
    }

    return NextResponse.json({
      success: true,
      portfolioId: inserted.id,
      fundCount: (parsedData as any)?.funds?.length || 0,
      redirectTo: "/dashboard"
    });

  } catch (error: any) {
    console.error("? Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Your existing CAS parser function
async function parseCASFile(file: File) {
  // ... your existing parser logic
  // Return: { funds: [], totalValue, investedAmount, currentReturns, xirr, ... }
}
