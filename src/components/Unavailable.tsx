import AppLayout from "./AppLayout";
import Link from "next/link";
export default function Unavailable({
  title,
  reason,
}: {
  title: string;
  reason: string;
}) {
  return (
    <AppLayout>
      <div className="trust-eyebrow">FolioKey · Data coverage</div>
      <h1>{title}</h1>
      <section className="trust-card">
        <h2>Not available yet</h2>
        <p>{reason}</p>
        <p>
          No estimated personal results or sample portfolios are displayed here.
        </p>
        <Link className="trust-button" href="/dashboard">
          View your portfolio
        </Link>
      </section>
    </AppLayout>
  );
}
