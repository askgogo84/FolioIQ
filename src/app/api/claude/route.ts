import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing ANTHROPIC_API_KEY. Add it in Vercel Project Settings > Environment Variables.",
        },
        { status: 500 }
      )
    }

    const body = await req.json()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error?.message || "Claude API request failed.",
          details: data,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error while calling Claude.",
      },
      { status: 500 }
    )
  }
}
