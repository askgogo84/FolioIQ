"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import type { Finding } from "@/lib/portfolio/insights";
export default function Page() {
  const [findings, setFindings] = useState<Finding[]>([]),
    [message, setMessage] = useState("Loading portfolio checks…");
  useEffect(() => {
    fetch("/api/intelligence")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setFindings(d.findings);
        setMessage(d.method);
      })
      .catch(() =>
        setMessage("Insights could not be loaded. Please retry later."),
      );
  }, []);
  return (
    <AppLayout>
      <div className="trust-eyebrow">Evidence-based observations</div>
      <h1>Understand what you own.</h1>
      <p role="status">{message}</p>
      {findings.map((f) => (
        <section className="trust-card" key={f.id}>
          <div className="trust-eyebrow">{f.kind}</div>
          <h2>{f.title}</h2>
          <p>{f.detail}</p>
          <small>Method: {f.method} · Based on your imported snapshot</small>
        </section>
      ))}
    </AppLayout>
  );
}
