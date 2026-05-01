"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const EMAIL_KEY = "folioiq_email"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [showLogin, setShowLogin] = useState(false)
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
            <Link href="/profile">Upload</Link>
            <Link href="/dashboard-v2">Dashboard</Link>
          </nav>
          <button onClick={() => setShowLogin(true)} className="rounded-full border border-[#009b63] px-5 py-2.5 text-sm font-black text-[#008b5a]">Login</button>
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
            Upload your portfolio and FolioIQ tells you what to fix, what to keep and what to add next.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setShowLogin(true)} className="rounded-full bg-[#009b63] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#009b63]/20">
              Check your portfolio
            </button>
            <Link href="/explore" className="rounded-full border border-black/10 bg-white px-8 py-4 text-sm font-black text-black">
              Skip and explore
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <Proof number="5 sec" label="action plan" />
            <Proof number="Cost" label="leakage check" />
            <Proof number="Simple" label="plain English" />
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

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="relative grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_140px_rgba(0,0,0,0.28)] md:grid-cols-[.9fr_1.1fr]">
            <button onClick={() => setShowLogin(false)} className="absolute right-5 top-4 z-10 text-2xl leading-none text-black/40 hover:text-black">x</button>

            <div className="hidden bg-[#17233f] p-8 text-white md:block">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-black text-[#17233f]">F</div>
              <div className="text-4xl font-black leading-tight">One place for smarter fund decisions.</div>
              <p className="mt-4 text-sm leading-6 text-white/65">Track, fix and improve your mutual fund portfolio without confusing tables.</p>
              <div className="mt-10 rounded-3xl bg-white/10 p-5">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Example insight</div>
                <div className="mt-2 text-2xl font-black">Cost leakage</div>
                <div className="mt-1 text-sm text-white/65">Find hidden cost drag before investing more.</div>
              </div>
            </div>

            <div className="p-7 md:p-10">
              <div className="text-center md:text-left">
                <div className="text-3xl font-black">Welcome to FolioIQ</div>
                <p className="mt-2 text-sm leading-6 text-black/55">Enter your email to save your analysis. You can also skip and try the product instantly.</p>
              </div>

              <div className="mt-8">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-black/35">Email ID</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="mt-2 min-h-14 w-full rounded-2xl border border-black/10 bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#009b63]"
                />
                <button onClick={goNext} className="mt-5 w-full rounded-2xl bg-[#009b63] px-6 py-4 text-sm font-black text-white">
                  Continue
                </button>
                <button onClick={skip} className="mt-4 w-full text-sm font-bold text-black/50 underline underline-offset-4">
                  Skip for now
                </button>
                {saved && <div className="mt-4 text-center text-xs font-bold text-[#009b63]">Email saved locally.</div>}
              </div>

              <div className="mt-8 rounded-2xl bg-[#f8fafc] p-4 text-xs leading-5 text-black/50">
                FolioIQ helps you understand portfolio quality and next actions.
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Proof({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
      <div className="text-lg font-black">{number}</div>
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-black/35">{label}</div>
    </div>
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
