"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { analysePortfolio } from "@/lib/folioiq/decision-engine"

export default function Dashboard() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem("folioiq_h")
    const m = localStorage.getItem("folioiq_meta")
    if (data) setHoldings(JSON.parse(data))
    if (m) setMeta(JSON.parse(m))
  }, [])

  const decision = useMemo(() => analysePortfolio(holdings), [holdings])

  if (!holdings.length) {
    return (
      <main className="min-h-screen bg-[#fbf7ee] px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl bg-white p-10 rounded-3xl shadow-xl">
          <h1 className="text-4xl font-black">Add your portfolio first</h1>
          <p className="mt-3 text-gray-600">Upload your mutual fund statement to see insights.</p>
          <Link href="/upload" className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl">Upload portfolio</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fbf7ee] px-6 py-10 text-black">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* SNAPSHOT */}
        <div className="bg-white p-8 rounded-3xl shadow-xl space-y-4">
          <h1 className="text-4xl font-black">{decision.plainEnglishVerdict}</h1>
          <p className="text-lg text-gray-700">{decision.simpleSummary}</p>

          <div className="grid md:grid-cols-4 gap-4 mt-4">
            <Stat label="Health Score" value={decision.healthScore + "/100"} />
            <Stat label="Confidence" value={decision.confidenceScore + "%"} />
            <Stat label="Annual Leakage" value={"₹" + decision.estimatedAnnualLeakage} />
            <Stat label="Risk Style" value={decision.riskStyle} />
          </div>
        </div>

        {/* START HERE */}
        {decision.review?.[0] && (
          <div className="bg-black text-white p-6 rounded-3xl">
            <div className="text-sm uppercase tracking-widest opacity-70">Start Here</div>
            <div className="text-2xl font-black mt-2">{decision.review[0].name}</div>
            <div className="mt-2">{decision.review[0].action}</div>
          </div>
        )}

        {/* TRUST */}
        {meta && (
          <div className="bg-white p-6 rounded-2xl border text-sm">
            <b>Data confidence:</b> {meta.confidence} · Detected {meta.savedCount}/{meta.expectedCount} funds
          </div>
        )}

        {/* FIX */}
        <Section title="Fix Now" items={decision.review} />

        {/* KEEP */}
        <Section title="Keep" items={decision.keep} />

        {/* EXPLORE */}
        <Section title="Explore" items={decision.add} />

      </div>
    </main>
  )
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-[#fffaf0] p-4 rounded-xl border">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-xl font-black">{value}</div>
    </div>
  )
}

function Section({ title, items }: any) {
  if (!items?.length) return null

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow">
            <div className="text-xl font-bold">{item.name}</div>
            <div className="text-gray-600 mt-2">{item.reason}</div>
            <div className="mt-4 bg-black text-white p-3 rounded-lg text-sm font-bold">{item.action}</div>
            {item.impact && <div className="text-sm mt-2 text-gray-500">Impact: {item.impact}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
