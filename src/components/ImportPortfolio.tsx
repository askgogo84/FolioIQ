"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "./AppLayout";
import { money } from "@/lib/portfolio/format";
type Preview = {
  draftId: string;
  holdings: {
    scheme_name: string;
    folio_label: string;
    units: number;
    current_value: number | null;
  }[];
  summary: { totalCurrent: number | null; totalInvested: number | null };
  warnings: string[];
  statementDate: string | null;
  transactionCount: number;
};
export default function ImportPortfolio({
  connect = false,
  configured = false,
}: {
  connect?: boolean;
  configured?: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null),
    [password, setPassword] = useState(""),
    [consent, setConsent] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<Preview | null>(null);
  async function response(res: Response) {
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || "Import failed. Please retry.");
    return d;
  }
  async function start() {
    setBusy(true);
    setError("");
    try {
      if (!consent) throw new Error("Please confirm consent first.");
      if (connect) {
        const token = await response(
          await fetch("/api/casparser/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent: true }),
          }),
        );
        const { open } = await import("@cas-parser/connect");
        const result = await open({
          accessToken: token.access_token,
          config: {
            enableCdslFetch: true,
            enableInbox: false,
            enableGenerator: true,
            homeLayout: "actions",
          },
        });
        if (result.status === "closed") return;
        if (result.status !== "success")
          throw new Error(
            "Provider connection did not complete. Please retry.",
          );
        setPreview(
          await response(
            await fetch("/api/casparser/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: result.data, consent: true }),
            }),
          ),
        );
      } else {
        if (!file) throw new Error("Select a CAS PDF.");
        const form = new FormData();
        form.append("file", file);
        form.append("password", password);
        form.append("consent", "true");
        setPreview(
          await response(
            await fetch("/api/upload", { method: "POST", body: form }),
          ),
        );
        setPassword("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import unavailable.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      await response(
        await fetch("/api/portfolio/import/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId: preview?.draftId,
            confirmReplace: confirmed,
          }),
        }),
      );
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppLayout>
      <div className="trust-eyebrow">
        A considered beginning · Your portfolio
      </div>
      <h1>{connect ? "Connect your portfolio." : "Import your portfolio."}</h1>
      <p>
        Bring your holdings into one considered view. You stay in control of
        what gets imported.
      </p>
      <ol className="fk-import-steps" aria-label="Import progress">
        {[
          "Choose your source",
          "Review the evidence",
          "Confirm your portfolio",
        ].map((step, i) => (
          <li
            key={step}
            aria-current={
              (!preview ? 0 : confirmed ? 2 : 1) === i ? "step" : undefined
            }
          >
            <span>{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="fk-import-assurance">
        <span>✓ Review before replacing</span>
        <span>✓ Separate folios preserved</span>
        <span>✓ Missing values stay unknown</span>
      </div>
      {!configured && (
        <div role="status" className="trust-notice">
          Portfolio import is temporarily unavailable while provider access is
          being secured. Existing holdings are preserved. Please return after
          setup is complete.
        </div>
      )}
      {error && (
        <div role="alert" className="trust-notice">
          {error}
        </div>
      )}
      {preview ? (
        <section className="trust-card">
          <h2>Review your import</h2>
          <p>
            {preview.holdings.length} positions · {preview.transactionCount}{" "}
            transaction records · Statement date:{" "}
            {preview.statementDate || "unknown"}
          </p>
          <p>
            Reported cost: {money(preview.summary.totalInvested)} · Value:{" "}
            {money(preview.summary.totalCurrent)}
          </p>
          <ul>
            {preview.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <div className="trust-table">
            <table>
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Folio</th>
                  <th>Units</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {preview.holdings.map((h, i) => (
                  <tr key={i}>
                    <td>{h.scheme_name}</td>
                    <td>{h.folio_label}</td>
                    <td>{h.units}</td>
                    <td>{money(h.current_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="trust-check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I reviewed the scope and warnings. Replace my current portfolio with
            these positions, retaining an import history.
          </label>
          <div className="trust-actions">
            <button disabled={busy || !confirmed} onClick={save}>
              {busy ? "Saving…" : "Confirm portfolio"}
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setPreview(null);
                setConfirmed(false);
              }}
            >
              Choose another statement
            </button>
          </div>
        </section>
      ) : (
        <section className="trust-card">
          {connect ? (
            <>
              <h2>Consent-based provider connection</h2>
              <p>
                CDSL OTP retrieval may require your PAN, date of birth and CDSL
                account ID. A mobile number alone does not retrieve every
                investment. OTP is entered in the provider widget; FolioKey does
                not store it.
              </p>
              <p>
                Only supported non-demat mutual fund folios are imported in this
                release. Review any excluded assets carefully. For wider mutual
                fund coverage, use the provider’s CAMS/KFintech statement
                request or upload a detailed CAS. A statement request is sent to
                your registered email; it does not establish ongoing sync.
              </p>
            </>
          ) : (
            <>
              <h2>CAMS / KFintech CAS PDF</h2>
              <p>
                Use the original statement with folio details. NJ valuation
                reports, images and spreadsheets are not yet supported by the
                validated importer.
              </p>
              <label>
                CAS PDF (up to 3 MB)
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={busy}
                />
              </label>
              <label>
                PDF password, if encrypted
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  maxLength={128}
                  disabled={busy}
                />
              </label>
            </>
          )}
          <label className="trust-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            I authorize sending this statement and any required decryption
            details to CASParser for this import. When using the connection
            widget, I also authorize the connection details and statement
            request I choose there. I have read the{" "}
            <Link href="/privacy">data-use notice</Link>.
          </label>
          <button
            disabled={!configured || busy || !consent || (!connect && !file)}
            onClick={start}
          >
            {busy
              ? "Processing…"
              : connect
                ? "Open provider connection"
                : "Parse and review"}
          </button>
          <p>
            <Link href={connect ? "/upload" : "/connect"}>
              {connect
                ? "Upload a CAS instead"
                : "Use Portfolio Connect for OTP or file upload"}{" "}
              →
            </Link>
          </p>
        </section>
      )}
    </AppLayout>
  );
}
