"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const EMAIL_KEY = "folioiq_email"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(EMAIL_KEY)
    if (existing) {
      setEmail(existing)
      setSaved(true)
    }
  }, [])

  function goNext() {
    if (email.trim()) {
      localStorage.setItem(EMAIL_KEY, email.trim())
      setSaved(true)
    }
    window.location.href = "/explore"
  }

  function skip() {
    window.location.href = "/explore"
  }

  return (
    <main className="min-h-screen bg-white text-[#161616]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-black text-white">F</div>
            <div className="text-lg font-black">FolioIQ</div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-black/65 md:flex">
            <Link href="/explore">Mutual Funds</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/dashboard-v2">Dashboard</Link>
          </nav>
          <Link href="/explore" className="rounded-full bg-[#009b63] px-5 py-2.5 text-sm font-black text-white">Check your portfolio</Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-[#e9fff5] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#008b5a]">
            Mutual Fund Portfolio Analysis
          </div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Make better mutual fund decisions.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-black/60">
            Upload your portfolio and FolioIQ tells you what to fix, what to keep and what to add next — in plain English.
          </p>

          <div className="mt-8 max-w-xl rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_22px_90px_rgba(0,0,0,0.08)]">
            <div className="mb-1 text-2xl font-black">Welcome to FolioIQ</div>
            <div className="mb-5 text-sm text-black/50">Enter your email to save your analysis, or skip and try it instantly.</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email ID"
                type="email"
                className="min-h-12 flex-1 rounded-2xl border border-black/10 bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#009b63]"
              />
              <button onClick={goNext} className="rounded-2xl bg-[#009b63] px-6 py-3 text-sm font-black text-white">
                Continue
              </button>
            </div>
            <button onClick={skip} className="mt-4 text-sm font-bold text-black/50 underline underline-offset-4">
              Skip for now
            </button>
            {saved && <div className="mt-3 text-xs font-bold text-[#009b63]">Email saved locally.</div>}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#e9fff5] via-white to-[#f4efe3] blur-2xl" />
          <div className="relative rounded-[2.5rem] border border-black/10 bg-white p-5 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
            <div className="rounded-[2rem] bg-[#111827] p-5 text-white">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Portfolio Score</div>
              <div className="mt-4 text-6xl font-black">74</div>
              <div className="mt-2 text-sm text-white/60">Decent, but needs cleanup.</div>
            </div>
            <div className="mt-4 grid gap-3">
              <Insight label="Fix Now" text="Regular plan cost drag detected" />
              <Insight label="Keep" text="Core flexi-cap exposure looks fine" />
              <Insight label="Explore" text="Missing debt cushion" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Insight({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fbfbfb] p-4">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-black/35">{label}</div>
      <div className="mt-1 text-sm font-black">{text}</div>
    </div>
  )
}
