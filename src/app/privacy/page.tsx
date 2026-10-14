import Link from "next/link";
export default function Page() {
  return (
    <main className="trust-landing">
      <Link href="/">FolioKey</Link>
      <h1>Privacy & data use</h1>
      <p>
        Updated 14 October 2026. This notice describes the current technical
        handling of portfolio data.
      </p>
      <h2>Sign-in and portfolio records</h2>
      <p>
        Supabase manages your login and stores your owner-scoped holdings,
        masked folio references, transaction records and import history. The
        current Supabase project is in Seoul; application functions may process
        requests in the United States. FolioKey does not claim India-only
        hosting.
      </p>
      <h2>Document imports</h2>
      <p>
        Saved goals, investment preferences, manual SIP schedules and allocation
        targets are self-reported and stored in your owner-scoped Supabase
        account. They are not sent to an AI model or used to execute
        transactions.
      </p>
      <p>
        When you consent to a CAS import, the document and any decryption
        details required are sent to CASParser. FolioKey does not persist the
        PDF password, OTP or original PDF. The application saves normalized
        investment records for review and confirmed imports; it excludes
        investor PAN, address and contact details from the import payload.
      </p>
      <p>
        Provider widgets process details you enter directly with that provider.
        Their processing and retention are governed by their own terms. Do not
        upload a statement unless you are authorized to use it.
      </p>
      <p>
        The provider connection also offers a CAMS/KFintech statement request
        delivered to your registered email. Details entered in that widget are
        processed by CASParser. This is not universal mobile-only portfolio
        retrieval or an ongoing synchronization mandate.
      </p>
      <h2>Retention and deletion</h2>
      <p>
        Normalized drafts, confirmed imports and the prior holdings snapshot are
        currently retained in your account. Drafts expire for confirmation after
        24 hours, but are not automatically erased. Self-service account/data
        deletion and a formal support contact are not yet configured. Do not use
        this beta if those requirements are essential for you.
      </p>
      <h2>Analytics and advice</h2>
      <p>
        Optional Jev question matching is disabled until separately configured.
        When enabled, an explicit consent checkbox sends only the question you
        type to TypeSafe for topic classification. Do not include identity
        details, OTPs, account numbers or statement contents. FolioKey does not
        automatically send your holdings or planning records. Answers are
        generated from fixed evidence templates; the AI cannot provide financial
        numbers or investment instructions. TypeSafe processes submitted
        questions under its own terms. FolioKey does not persist the question; a
        separate usage counter stores your account ID and submission time,
        including failed attempts.
      </p>
      <p>
        This release does not send your statement to an AI model for
        recommendations. Future data uses require a corresponding disclosure and
        consent.
      </p>
      <Link href="/auth">Back to sign in</Link>
    </main>
  );
}
