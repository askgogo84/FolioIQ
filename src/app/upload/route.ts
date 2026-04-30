import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'image/png',
      'image/jpeg',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, Excel, CSV, or image files." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Save file to temporary storage
    // 2. Parse PDF with pdf-parse or similar library
    // 3. Parse Excel with xlsx library
    // 4. Extract mutual fund data
    // 5. Return structured portfolio data

    // For now, return success with mock data
    return NextResponse.json({
      success: true,
      message: "File received successfully",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      // Mock extracted data
      extractedFunds: 8,
      confidence: 0.95,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Upload API is running",
    supportedFormats: ["pdf", "xlsx", "xls", "csv", "png", "jpg", "jpeg"],
    maxFileSize: "10MB"
  });
}