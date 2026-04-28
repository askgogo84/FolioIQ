"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

const fundMap: Record<string, any> = {
  "hdfc-flexi-cap-fund": ["HDFC Flexi Cap Fund", "Flexi Cap", "20.37%", "Moderately High", "₹79,450 Cr", "0.78%"],
  "parag-parikh-flexi-cap-fund": ["Parag Parikh Flexi Cap Fund", "Flexi Cap", "18.15%", "Moderately High", "₹82,100 Cr", "0.63%"],
  "motilal-oswal-midcap-fund": ["Motilal Oswal Midcap Fund", "Mid Cap", "22.89%", "High", "₹24,600 Cr", "0.71%"],
  "nippon-india-small-cap-fund": ["Nippon India Small Cap Fund", "Small Cap", "25.10%", "Very High", "₹61,900 Cr", "0.68%"],
  "icici-prudential-bluechip-fund": ["ICICI Prudential Bluechip Fund", "Large Cap", "16.42%", "Moderate", "₹58,700 Cr", "0.89%"],
  "sbi-contra-fund": ["SBI Contra Fund", "Contra", "19.40%", "High", "₹38,200 Cr", "0.74%"],
  "axis-elss-tax-saver-fund": ["Axis ELSS Tax Saver Fund", "ELSS", "14.85%", "High", "₹36,800 Cr", "0.82%"],
}

export default function FundDetailPage() {
  const params = useParams()
  const slug = String(params.slug || "")
  const fund = fundMap[slug] || ["Mutual Fund", "Equity", "18.20%", "Moderately High", "₹10,000 Cr", "0.75%"]
  const [name, category, returns, risk, aum, expense] = fund

  return (
    <main className="min-h-screen bg-[#f6f8fb] pb-28 text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4 md:max-w-6xl md:px-8">
          <Link href="/explore" className="text-2xl font-black">‹</Link>
          <div className="font-black">Fund Details</div>
          <Link href="/upload" className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white">Upload</Link>
        </div>
      </header>

      <section className="mx-auto max-w-md px-4 py-5 md:max-w-5xl md:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{category}</div>
          <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">{name}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">A direct-growth style fund profile with key checks for returns, risk, cost and suitability.</p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="3Y Return" value={returns} tone="text-emerald-600" />
            <Metric label="Risk" value={risk} />
            <Metric label="AUM" value={aum} />
            <Metric label="Expense" value={expense} tone="text-red-600" />
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] bg-gradient-to-br from-[#071021] to-[#111827] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">FolioIQ View</div>
          <div className="mt-5 text-2xl font-black leading-tight">Should you add this fund?</div>
          <p className="mt-3 text-sm leading-6 text-white/65">This fund can be considered only if it does not overlap with funds already in your portfolio. Upload your holdings to get a clear add / avoid verdict.</p>
          <Link href="/upload" className="mt-6 flex w-full justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#111827]">Analyze with my portfolio</Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Info title="Performance" text="Compare returns against category and benchmark before investing." />
          <Info title="Cost" text="Lower expense ratio improves long-term compounding." />
          <Info title="Overlap" text="Avoid adding another fund if your portfolio already has similar exposure." />
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.07)]">
          <div className="text-xl font-black">Fund checklist</div>
          <div className="mt-4 space-y-3">
            <Check label="Returns are category competitive" ok />
            <Check label="Expense ratio needs comparison" />
            <Check label="Check overlap before adding SIP" />
            <Check label="Use only if it fits asset allocation" />
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-4 py-3 text-center text-xs font-bold text-slate-400">
          <Link href="/dashboard-v2">⌂<div>Dashboard</div></Link>
          <Link href="/explore" className="text-emerald-600">◌<div>Explore</div></Link>
          <Link href="/upload" className="-mt-6"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-xl">+</div><div className="mt-1 text-slate-500">Upload</div></Link>
          <Link href="/calculators/sip">▦<div>Calculators</div></Link>
          <Link href="/home">♙<div>Profile</div></Link>
        </div>
      </nav>
    </main>
  )
}

function Metric({ label, value, tone = "text-[#111827]" }: any) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div><div className={`mt-2 text-lg font-black ${tone}`}>{value}</div></div>
}

function Info({ title, text }: any) {
  return <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]"><div className="text-lg font-black">{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>
}

function Check({ label, ok = false }: any) {
  return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{ok ? "✓" : "!"}</span><span className="text-sm font-semibold text-slate-600">{label}</span></div>
}
