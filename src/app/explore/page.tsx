"use client"

import Link from "next/link"

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-4 text-4xl font-black">Mutual Fund Explore</h1>

        <p className="mb-10 text-black/60">
          Upload your portfolio or start building one.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-bold">Upload your portfolio</h2>
            <p className="mb-4 text-sm text-black/50">
              Upload your statement and get instant analysis.
            </p>

            <Link
              href="/upload"
              className="rounded-xl bg-black px-5 py-2 font-bold text-white"
            >
              Upload Now
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-bold">Add manually</h2>
            <p className="mb-4 text-sm text-black/50">
              Build your portfolio from scratch.
            </p>

            <Link
              href="/dashboard-v2"
              className="rounded-xl border px-5 py-2 font-bold"
            >
              Add Funds
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
