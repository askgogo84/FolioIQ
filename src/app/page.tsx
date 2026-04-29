export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto text-center pt-20 pb-16 px-4">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          FolioIQ - Smart Mutual Fund Analyzer
        </h1>
        <p className="text-xl text-slate-600 mb-12">
          Upload your portfolio and get AI-powered insights
        </p>
        <a href="/dashboard" className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold">
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
