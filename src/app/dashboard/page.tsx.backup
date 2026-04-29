"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem("folioiq_h");
    if (data) setHoldings(JSON.parse(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">FolioIQ Dashboard</h1>
      <p className="text-slate-600 mb-6">Your portfolio analysis tool</p>
      
      {holdings.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
          <p className="text-lg text-slate-500 mb-4">No funds added yet</p>
          <a href="/upload" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold">
            Upload Portfolio
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-lg font-semibold text-slate-900">{holdings.length} funds loaded</p>
        </div>
      )}
    </div>
  );
}
