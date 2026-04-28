"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

const questions = [
  { question: "How long are you planning to stay invested?", options: [{ label: "Under 1 year", score: 1 }, { label: "1 to 3 years", score: 2 }, { label: "3 to 7 years", score: 3 }, { label: "7+ years", score: 4 }] },
  { question: "If your portfolio fell 30% in 3 months, what would you do?", options: [{ label: "Panic and sell all", score: 1 }, { label: "Sell some to reduce risk", score: 2 }, { label: "Hold steady and wait", score: 3 }, { label: "Buy more if fundamentals are strong", score: 4 }] },
  { question: "What is your main investment goal?", options: [{ label: "Protect capital", score: 1 }, { label: "Steady growth with lower volatility", score: 2 }, { label: "Long-term wealth creation", score: 3 }, { label: "Maximum growth, higher risk is fine", score: 4 }] },
  { question: "How much monthly SIP can you commit comfortably?", options: [{ label: "Under ₹5,000", score: 1 }, { label: "₹5,000 to ₹25,000", score: 2 }, { label: "₹25,000 to ₹1 lakh", score: 3 }, { label: "Over ₹1 lakh", score: 4 }] },
  { question: "How experienced are you with market-linked investments?", options: [{ label: "Beginner", score: 1 }, { label: "Mostly FD, PPF or RD", score: 2 }, { label: "Have mutual funds or stocks", score: 3 }, { label: "Active investor", score: 4 }] },
]

function getProfile(total: number) {
  if (total <= 10) return { label: "Conservative", allocation: "50% Debt/Liquid, 30% Hybrid/BAF, 20% Large Cap", note: "Your priority should be capital protection, smoother returns and avoiding high drawdowns." }
  if (total <= 15) return { label: "Balanced", allocation: "35% Large Cap, 25% Flexi Cap, 25% Mid Cap, 15% Debt", note: "You can take equity exposure, but should avoid unnecessary fund overlap and excessive small-cap risk." }
  return { label: "Aggressive", allocation: "35% Small/Mid Cap, 30% Flexi Cap, 20% Large Cap, 15% Tactical", note: "You can handle volatility, but still need discipline, diversification and tax awareness." }
}

export default function RiskProfilePage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const total = useMemo(() => answers.reduce((sum, score) => sum + score, 0), [answers])
  const isDone = answers.length === questions.length
  const profile = isDone ? getProfile(total) : null
  const progress = Math.round((answers.length / questions.length) * 100)

  function selectAnswer(score: number) {
    if (isDone) return
    setAnswers((current) => [...current, score])
    setStep((current) => Math.min(current + 1, questions.length - 1))
  }

  function resetQuiz() { setStep(0); setAnswers([]) }

  return (
    <main className="min-h-screen bg-[#f7f3e8] text-[#11100d]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.22),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(22,163,74,.10),transparent_24%)]" />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffaf0]/80 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/dashboard-v2" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4d27a] to-[#8d6b22] text-sm font-black text-black shadow-[0_0_26px_rgba(212,175,55,.35)]">F</div>
              <div><div className="text-lg font-black tracking-tight">FolioIQ</div><div className="text-[10px] uppercase tracking-[0.28em] text-[#8d6b22]">Risk Intelligence</div></div>
            </Link>
            <Link href="/dashboard-v2" className="rounded-full bg-[#11100d] px-5 py-2 text-sm font-bold text-white">Dashboard</Link>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <div className="mb-4 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15 px-3 py-1 text-xs font-bold text-[#8d6b22]">Investor Suitability</div>
            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">Know your risk style before your money moves.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/55">Answer five quick questions. FolioIQ will classify your profile and suggest a sensible mutual fund allocation direction.</p>
          </div>

          <div className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="mb-8">
              <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.22em] text-black/35"><span>Progress</span><span>{progress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#d4af37] transition-all" style={{ width: `${progress}%` }} /></div>
            </div>

            {!isDone ? (
              <div>
                <p className="text-sm font-black text-[#8d6b22]">Question {step + 1} of {questions.length}</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">{questions[step].question}</h2>
                <div className="mt-8 grid gap-3">
                  {questions[step].options.map((option) => <button key={option.label} onClick={() => selectAnswer(option.score)} className="rounded-2xl border border-black/10 bg-[#fffaf0] px-5 py-4 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[#d4af37] hover:bg-[#fff2bd]">{option.label}</button>)}
                </div>
              </div>
            ) : profile && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#11100d] text-2xl font-black text-[#f4d27a]">F</div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-black/35">Your profile</p>
                <h2 className="mt-3 text-5xl font-black text-[#8d6b22]">{profile.label}</h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55">{profile.note}</p>
                <div className="mt-8 rounded-2xl border border-[#d4af37]/35 bg-[#fff7d6] p-6 text-left"><p className="text-xs font-black uppercase tracking-widest text-[#8d6b22]">Suggested allocation direction</p><p className="mt-3 text-2xl font-black">{profile.allocation}</p><p className="mt-3 text-xs leading-6 text-black/55">Educational view only. This is not financial advice.</p></div>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard-v2" className="rounded-full bg-[#11100d] px-7 py-3 text-sm font-bold text-white">Build Portfolio</Link><button onClick={resetQuiz} className="rounded-full border border-black/10 bg-white px-7 py-3 text-sm font-bold">Retake Quiz</button></div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
