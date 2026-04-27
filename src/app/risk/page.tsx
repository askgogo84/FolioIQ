"use client"

import { useMemo, useState } from "react"

const questions = [
  {
    question: "How long are you planning to stay invested?",
    options: [
      { label: "Under 1 year", score: 1 },
      { label: "1 to 3 years", score: 2 },
      { label: "3 to 7 years", score: 3 },
      { label: "7+ years", score: 4 },
    ],
  },
  {
    question: "If your portfolio fell 30% in 3 months, what would you do?",
    options: [
      { label: "Panic and sell all", score: 1 },
      { label: "Sell some to reduce risk", score: 2 },
      { label: "Hold steady and wait", score: 3 },
      { label: "Buy more if fundamentals are strong", score: 4 },
    ],
  },
  {
    question: "What is your main investment goal?",
    options: [
      { label: "Protect capital", score: 1 },
      { label: "Steady growth with lower volatility", score: 2 },
      { label: "Long-term wealth creation", score: 3 },
      { label: "Maximum growth, higher risk is fine", score: 4 },
    ],
  },
  {
    question: "How much monthly SIP can you commit comfortably?",
    options: [
      { label: "Under Rs. 5,000", score: 1 },
      { label: "Rs. 5,000 to Rs. 25,000", score: 2 },
      { label: "Rs. 25,000 to Rs. 1 lakh", score: 3 },
      { label: "Over Rs. 1 lakh", score: 4 },
    ],
  },
  {
    question: "How experienced are you with market-linked investments?",
    options: [
      { label: "Beginner", score: 1 },
      { label: "Mostly FD, PPF or RD", score: 2 },
      { label: "Have mutual funds or stocks", score: 3 },
      { label: "Active investor", score: 4 },
    ],
  },
]

function getProfile(total: number) {
  if (total <= 10) {
    return {
      label: "Conservative",
      emoji: "Shield",
      color: "#1d4ed8",
      allocation: "50% Debt/Liquid, 30% Hybrid/BAF, 20% Large Cap",
      note: "Your priority should be capital protection, smoother returns and avoiding high portfolio drawdowns.",
    }
  }

  if (total <= 15) {
    return {
      label: "Moderate",
      emoji: "Balance",
      color: "#b45309",
      allocation: "35% Large Cap, 25% Flexi Cap, 25% Mid Cap, 15% Debt",
      note: "You can take equity exposure, but your portfolio should avoid unnecessary fund overlap and excessive small-cap risk.",
    }
  }

  return {
    label: "Aggressive",
    emoji: "Growth",
    color: "#c0392b",
    allocation: "35% Small/Mid Cap, 30% Flexi Cap, 20% Large Cap, 15% Sectoral or Tactical",
    note: "You can handle volatility, but the portfolio still needs discipline, diversification and tax awareness.",
  }
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

  function resetQuiz() {
    setStep(0)
    setAnswers([])
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1a1714]">
      <header className="sticky top-0 z-50 border-b border-[#e0dcd5] bg-white/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1714] text-white">
              <span className="font-serif text-xl italic">F</span>
            </div>
            <div>
              <div className="font-serif text-2xl leading-none">FolioIQ</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a857e]">
                Risk Profile
              </div>
            </div>
          </a>

          <a
            href="/dashboard"
            className="rounded-full bg-[#1a1714] px-5 py-2 text-xs font-semibold text-white"
          >
            Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1a7a4a]">
            Investor Suitability
          </p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Know your risk style</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4a453f]">
            Answer five quick questions. FolioIQ will classify your risk profile and suggest a sensible mutual fund allocation direction.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-3xl border border-[#e0dcd5] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#efecea]">
              <div className="h-full rounded-full bg-[#1a7a4a] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {!isDone ? (
            <div>
              <p className="text-sm font-semibold text-[#1a7a4a]">
                Question {step + 1} of {questions.length}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight">
                {questions[step].question}
              </h2>

              <div className="mt-8 grid gap-3">
                {questions[step].options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => selectAnswer(option.score)}
                    className="rounded-2xl border border-[#e0dcd5] bg-[#fafaf8] px-5 py-4 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#1a7a4a] hover:bg-[#e8f5ee] hover:text-[#1a7a4a]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            profile && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1714] text-white">
                  <span className="font-serif text-3xl italic">F</span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#8a857e]">
                  Your profile
                </p>
                <h2 className="mt-3 font-serif text-5xl" style={{ color: profile.color }}>
                  {profile.label}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#4a453f]">
                  {profile.note}
                </p>

                <div className="mt-8 rounded-2xl border border-[#b6ddc8] bg-[#f0faf5] p-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">
                    Suggested allocation direction
                  </p>
                  <p className="mt-3 font-serif text-2xl">{profile.allocation}</p>
                  <p className="mt-3 text-xs leading-6 text-[#4a453f]">
                    Educational view only. This is not financial advice. Final fund selection should consider your goals, income stability, existing assets, tax slab and emergency fund.
                  </p>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <a
                    href="/dashboard"
                    className="rounded-full bg-[#1a1714] px-7 py-3 text-sm font-semibold text-white shadow-md"
                  >
                    Build Portfolio
                  </a>
                  <button
                    onClick={resetQuiz}
                    className="rounded-full border border-[#d0ccc5] bg-white px-7 py-3 text-sm font-semibold"
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  )
}
