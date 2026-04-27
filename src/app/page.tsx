export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1a1714]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-2xl bg-[#1a1714] px-5 py-3 text-white shadow-lg">
          <span className="font-serif text-2xl italic">F</span>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#1a7a4a]">
          India Mutual Fund Intelligence
        </p>

        <h1 className="max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
          FolioIQ
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4a453f]">
          Your personal mutual fund intelligence dashboard with live NAV tracking,
          after-tax returns, portfolio health score, risk profiling and AI-powered
          fund recommendations.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/dashboard"
            className="rounded-full bg-[#1a1714] px-8 py-4 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#2d2926]"
          >
            Open Dashboard
          </a>

          <a
            href="/risk"
            className="rounded-full border border-[#d0ccc5] bg-white px-8 py-4 text-sm font-semibold text-[#1a1714] transition hover:-translate-y-0.5 hover:bg-[#efecea]"
          >
            Take Risk Profile
          </a>
        </div>

        <div className="mt-14 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#1a7a4a]">01</p>
            <h3 className="mt-3 font-serif text-2xl">Live NAV</h3>
            <p className="mt-2 text-sm leading-6 text-[#4a453f]">
              Search and track Indian mutual funds using live MFAPI data.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#1a7a4a]">02</p>
            <h3 className="mt-3 font-serif text-2xl">After-tax returns</h3>
            <p className="mt-2 text-sm leading-6 text-[#4a453f]">
              See the money you actually keep after STCG, LTCG and slab tax.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-[#1a7a4a]">03</p>
            <h3 className="mt-3 font-serif text-2xl">AI Advisor</h3>
            <p className="mt-2 text-sm leading-6 text-[#4a453f]">
              Get direct recommendations on what to exit, hold and double down.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
