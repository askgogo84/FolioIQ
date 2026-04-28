import { NextRequest, NextResponse } from "next/server"
import { MFAPI_BASE_URL } from "@/lib/folioiq/constants"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const res = await fetch(`${MFAPI_BASE_URL}/mf/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()

    return NextResponse.json({ results: data.slice(0, 10) })
  } catch (e) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
