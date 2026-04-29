// app/api/upload/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCASStatement } from "@/lib/parsers/cas-parser";
import { analyzePortfolio } from "@/lib/analysis/portfolio-analyzer";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Parse file
    const buffer = Buffer.from(await file.arrayBuffer());
    const holdings = await parseCASStatement(buffer, file.name);

    if (holdings.length === 0) {
      return NextResponse.json({ error: "No valid holdings found in file" }, { status: 400 });
    }

    // Analyze each holding
    const analyzedHoldings = await analyzePortfolio(holdings);

    // Save to Supabase
    const supabase = await createClient();

    // Delete existing holdings for user
    await supabase.from("holdings").delete().eq("user_id", userId);

    // Insert new holdings
    const { error } = await supabase.from("holdings").insert(
      analyzedHoldings.map(h => ({
        ...h,
        user_id: userId,
      }))
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save holdings" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      holdings: analyzedHoldings,
      message: `Successfully processed ${analyzedHoldings.length} funds`,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
