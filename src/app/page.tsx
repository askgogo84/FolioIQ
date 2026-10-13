import Link from "next/link";
export default function Home() {
  return (
    <main className="trust-landing">
      <nav>
        <Link className="trust-brand" href="/">
          FolioKey
        </Link>
        <Link href="/auth">Sign in</Link>
      </nav>
      <div className="trust-eyebrow">Your investments, understood</div>
      <h1>
        Clarity for your
        <br />
        <em>mutual fund portfolio.</em>
      </h1>
      <p>
        Bring your investments together, review the data behind them and
        understand what needs attention.
      </p>
      <Link className="trust-button" href="/auth">
        Start your portfolio review →
      </Link>
      <div className="trust-grid">
        <section className="trust-card">
          <h2>Imports currently paused</h2>
          <p>
            Existing holders can review their saved snapshot. New imports and
            provider connections are paused during security containment.
          </p>
        </section>
        <section className="trust-card">
          <h2>Know the evidence</h2>
          <p>
            See dated holdings, cost coverage and transaction records. Missing
            data stays visible.
          </p>
        </section>
        <section className="trust-card">
          <h2>Make informed decisions</h2>
          <p>
            Understand concentration and data gaps. Advanced recommendations are
            not yet available.
          </p>
        </section>
      </div>
      <p>
        FolioKey is being developed as a portfolio analysis tool. It does not
        execute investments or guarantee returns.
      </p>
      <footer>
        <Link href="/privacy">Privacy & data use</Link> ·{" "}
        <Link href="/terms">Terms & availability</Link>
      </footer>
    </main>
  );
}
