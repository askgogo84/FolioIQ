import Link from "next/link";
export default function Page() {
  return (
    <main className="trust-landing">
      <Link href="/">FolioKey</Link>
      <h1>Terms & availability</h1>
      <p>
        FolioKey is a beta portfolio analysis tool. Use only investment
        statements you are authorized to access. Review imported values and
        coverage against your original statement before relying on them.
      </p>
      <p>
        Displayed holding gains are not lifetime portfolio returns. Missing
        history, unverified valuations or incomplete cost data can limit
        analysis. Future returns are not guaranteed.
      </p>
      <p>
        This release does not provide investment execution, personalized
        buy/sell instructions, certified tax filing reports or paid
        subscriptions. We do not claim SEBI investment-adviser registration.
        Seek an appropriately qualified professional when needed.
      </p>
      <p>
        Provider connections require your consent and may have additional
        identity and coverage requirements. A mobile number alone is not a
        guarantee of complete portfolio retrieval.
      </p>
      <Link href="/privacy">Read privacy and data-use details</Link>
    </main>
  );
}
