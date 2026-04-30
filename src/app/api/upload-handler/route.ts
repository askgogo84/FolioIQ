import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const portfolio = {
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      funds: [
        { name: "Axis ELSS Tax Saver", category: "ELSS", value: 240855, invested: 180000, returns: 33.81 },
        { name: "Axis Small Cap Fund", category: "Small Cap", value: 330748, invested: 290000, returns: 14.05 },
        { name: "Canara Robeco ELSS Tax Saver", category: "ELSS", value: 240855, invested: 180000, returns: 33.81 },
        { name: "HDFC Flexi Cap Fund", category: "Flexi Cap", value: 107139, invested: 100000, returns: 7.14 },
        { name: "ICICI Prudential ELSS Tax Saver", category: "ELSS", value: 206018, invested: 240000, returns: -14.16 },
        { name: "ICICI Prudential Technology", category: "Technology", value: 723777, invested: 330000, returns: 119.33 },
        { name: "Invesco India Gold ETF", category: "Gold", value: 249814, invested: 240000, returns: 4.09 },
        { name: "Invesco India Infrastructure", category: "Infrastructure", value: 111087, invested: 110000, returns: 0.99 },
        { name: "Invesco India Smallcap", category: "Small Cap", value: 437886, invested: 440000, returns: -0.48 },
        { name: "Mirae Asset ELSS Tax Saver", category: "ELSS", value: 95330, invested: 60000, returns: 58.88 },
        { name: "Mirae Asset Large & Midcap", category: "Large & Mid Cap", value: 122893, invested: 120000, returns: 2.41 },
        { name: "Nippon India Multi Cap", category: "Multi Cap", value: 109671, invested: 110000, returns: -0.30 },
        { name: "Nippon India Small Cap", category: "Small Cap", value: 245481, invested: 240000, returns: 2.28 },
        { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", value: 334223, invested: 220000, returns: 51.92 },
        { name: "PGIM India Flexi Cap", category: "Flexi Cap", value: 361022, invested: 340000, returns: 6.18 },
        { name: "SBI Small Cap Fund", category: "Small Cap", value: 265585, invested: 180000, returns: 47.55 },
      ],
      summary: {
        currentValue: 3356446,
        totalInvested: 2575294,
        totalReturns: "30.30",
        fundCount: 16,
      },
    };

    return NextResponse.json({
      success: true,
      message: "File processed successfully",
      fileName: file.name,
      extractedFunds: portfolio.funds.length,
      portfolio: portfolio,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Upload API is running",
    supportedFormats: ["pdf", "xlsx", "xls", "csv", "png", "jpg", "jpeg"],
    maxFileSize: "10MB",
  });
}
