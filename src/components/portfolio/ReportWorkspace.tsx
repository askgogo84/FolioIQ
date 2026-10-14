import Link from "next/link";
import AppLayout from "../AppLayout";
export default function ReportWorkspace() {
  return (
    <AppLayout>
      <span className="fk-kicker">Your records / In your hands</span>
      <h1>Take your evidence with you.</h1>
      <p>
        Download your reported holdings and the latest statement assessment.
        Exports are private account records, not audited valuations or tax
        reports.
      </p>
      <div className="fk-action-grid">
        <a className="fk-action" href="/api/portfolio/export?format=csv">
          <h2>Holdings CSV ↧</h2>
          <p>
            Scheme identifiers, masked folios, units, source cost, values and
            dates. Unknown values remain blank.
          </p>
        </a>
        <a className="fk-action" href="/api/portfolio/export?format=json">
          <h2>Evidence JSON ↧</h2>
          <p>
            Holdings, reconciliation blockers, statement XIRR when eligible, and
            source FIFO analysis.
          </p>
        </a>
        <Link href="/capital-gains" className="fk-action">
          <h2>Inspect transaction lots →</h2>
          <p>
            Review supported acquisitions and redemptions before any tax work.
          </p>
        </Link>
      </div>
      <p className="trust-notice">
        Downloads contain your financial information. Keep them private. No PAN,
        original PDF, password or OTP is included.
      </p>
    </AppLayout>
  );
}
