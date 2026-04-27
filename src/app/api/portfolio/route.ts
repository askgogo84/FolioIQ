import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase"

function missingSupabaseResponse() {
  return NextResponse.json(
    {
      mode: "local",
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable cloud save.",
      holdings: [],
    },
    { status: 200 }
  )
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasSupabaseEnv()) return missingSupabaseResponse()

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mode: "cloud", holdings: data || [] })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasSupabaseEnv()) return NextResponse.json({ mode: "local", saved: false })

  const body = await req.json()
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("portfolio_holdings")
    .upsert(
      {
        clerk_user_id: userId,
        scheme_code: String(body.schemeCode),
        scheme_name: body.schemeName,
        category: body.category,
        amc: body.amc,
        units: body.units,
        avg_nav: body.avgNav,
        purchase_date: body.purchaseDate,
        current_nav: body.currentNav,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id,scheme_code" }
    )
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mode: "cloud", holding: data?.[0] || null })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasSupabaseEnv()) return NextResponse.json({ mode: "local", deleted: false })

  const { schemeCode } = await req.json()
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("portfolio_holdings")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("scheme_code", String(schemeCode))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mode: "cloud", success: true })
}
