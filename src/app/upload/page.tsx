// @ts-nocheck
/* eslint-disable */
"use client"

import { useRef, useState } from "react"
import Link from "next/link"

const STORAGE_KEY = "folioiq_h"
const META_KEY = "folioiq_meta"

export default function UploadPage() {
  const fileRef = useRef(null)
  const [stage, setStage] = useState("idle")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")

  async function handleFile(file) {
    setFileName(file.name)
    setError("")
    setStage("reading")

    const form = new FormData()
    form.append("file", file)

    try {
      const res = await fetch("/api/upload-portfolio", { method: "POST", body: form })
      const data = await res.json()

      if (!data.success || !data.holdings?.length) {
        setError(data.error || "We could not detect funds. Try a clearer screenshot, PDF or Excel file.")
        setStage("error")
        return
      }

      setStage("pricing")
      const enriched = await enrich(data.holdings)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched))
      localStorage.setItem(
        META_KEY,
        JSON.stringify({
          source: file.name,
          parseMethod: data.parseMethod || "unknown",
          expectedCount: data.expectedCount || data.totalExtracted || enriched.length,
          extractedCount: data.totalExtracted || enriched.length,
          matchedCount: data.totalMatched || enriched.length,
          savedCount: enriched.length,
          unmatched: data.unmatched || [],
          confidence:
            enriched.length >= Number(data.expectedCount || data.totalExtracted || enriched.length) * 0.85
              ? "High"
              : enriched.length >= Number(data.expectedCount || data.totalExtracted || enriched.length) * 0.65
                ? "Medium"
                : "Low",
          uploadedAt: new Date().toISOString(),
        })
      )

      window.location.href = "/dashboard-v2"
    } catch (err) {
      setError("Upload failed. Please try again.")
      setStage("error")
    }
  }

  async function enrich(raw) {
    const out = []
    for (const h of raw) {
      try {
        const d = await (await fetch("https://api.mfapi.in/mf/" + h.schemeCode)).json()
        const nav = d?.data || []
        const liveNAV = nav.length ? Number(nav[0].nav) : Number(h.preEnrichedCurrentNAV || h.currentNAV || 0)
        const units = Number(h.units || 0)
        const avgNav = Number(h.avgNav || liveNAV || 0)
        const investedAmount = Number(h.investedAmount || units * avgNav || 0)
        const currentValue = Number(h.preEnrichedCurrentValue || h.currentValue || units * liveNAV || investedAmount)

        out.push({
          ...h,
          schemeName: h.schemeName,
          category: h.category || d?.meta?.scheme_category || "Mutual Fund",
          amc: h.amc || d?.meta?.fund_house || "",
          units,
          avgNav,
          currentNAV: liveNAV,
          investedAmount,
          currentValue,
          purchaseDate: h.purchaseDate || new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10),
          sipAmount: Number(h.sipAmount || 0),
        })
      } catch {
        out.push(h)
      }
    }
    return out
  }

  return (
    <main className="min-h-screen bg-[#fbf7ee] text-[#12100d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,55,.18),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(34,197,94,.08),transparent_26%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbf7ee]/85 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d879] to-[#9b741f] text-sm font-black text-black">F</div>
              <div>
                <div className="text-lg font-black">FolioIQ</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9b741f]">Portfolio Upload</div>
              </div>
            </Link>
            <Link href="/dashboard-v2" className="rounded-full bg-[#11100d] px-5 py-2 text-sm font-black text-white">Dashboard</Link>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#9b741f]">Step 1</div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Upload once. See what to fix.</h1>
            <p className="mt-4 text-base leading-7 text-black/55">FolioIQ reads your statement, saves the portfolio locally and takes you directly to the decision dashboard.</p>
          </div>

          {stage === "idle" && (
            <div className="rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_22px_80px_rgba(20,16,8,0.08)]">
              <button onClick={() => fileRef.current?.click()} className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-black/15 bg-[#fffaf0] p-8 text-center transition hover:border-[#d4af37] hover:bg-[#fff4cc]">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5d879] text-3xl">📤</div>
                <div className="text-2xl font-black">Upload mutual fund portfolio</div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">Excel, CSV, CAS PDF, NJ Wealth PDF or screenshot. We’ll detect funds and open the dashboard automatically.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold text-black/55">
                  <span className="rounded-full bg-white px-3 py-2">Excel</span>
                  <span className="rounded-full bg-white px-3 py-2">PDF</span>
                  <span className="rounded-full bg-white px-3 py-2">Screenshot</span>
                  <span className="rounded-full bg-white px-3 py-2">CSV</span>
                </div>
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                <b>Trust layer:</b> the dashboard will show how many funds were detected and how confident FolioIQ is before recommending actions.
              </div>
            </div>
          )}

          {(stage === "reading" || stage === "pricing") && (
            <div className="rounded-[2rem] border border-black/10 bg-white/90 p-12 text-center shadow-[0_22px_80px_rgba(20,16,8,0.08)]">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5d879] text-3xl">✨</div>
              <div className="text-2xl font-black">{stage === "reading" ? "Reading your portfolio" : "Preparing decision dashboard"}</div>
              <p className="mt-2 text-sm text-black/55">{fileName}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-black/35">Redirecting automatically</p>
            </div>
          )}

          {stage === "error" && (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-3xl">⚠️</div>
              <div className="mt-3 font-black text-red-700">{error}</div>
              <button onClick={() => setStage("idle")} className="mt-6 rounded-full bg-[#11100d] px-6 py-3 text-sm font-black text-white">Try again</button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
