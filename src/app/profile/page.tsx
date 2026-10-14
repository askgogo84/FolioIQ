"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { createClient } from "@/utils/supabase/client";
export default function Page() {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data, error }) => {
        if (error || !data.user) {
          setMessage("Please sign in again.");
          return;
        }
        setName(data.user.user_metadata?.full_name || "");
        setEmail(data.user.email || "");
        setReady(true);
      })
      .catch(() =>
        setMessage("Your profile could not be loaded. Please reload."),
      );
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({
        data: { full_name: name.trim(), onboarding_completed: true },
      });
      setMessage(
        error
          ? "Your profile could not be saved. Please retry."
          : "Profile saved.",
      );
    } catch {
      setMessage("Your profile could not be saved. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppLayout>
      <span className="fk-kicker">Your workspace · Your preferences</span>
      <h1>Make it yours.</h1>
      <p>Your account details are separate from your investment preferences.</p>
      <form onSubmit={save} className="trust-card">
        <label>
          Email
          <input value={email} disabled />
        </label>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            disabled={!ready}
          />
        </label>
        <button disabled={!ready || busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
        <p role="status">{message}</p>
        <p>
          Sign-in and sessions are managed by Supabase. No paid membership or
          risk profile has been assigned.
        </p>
      </form>
      <div className="fk-action-grid">
        <Link className="fk-action" href="/risk-profile">
          <h3>Your risk perspective</h3>
          <p>
            No risk profile has been inferred. See what is needed for
            suitability.
          </p>
        </Link>
        <Link className="fk-action" href="/goals">
          <h3>Give your wealth a purpose</h3>
          <p>
            Goal planning needs your horizon, liquidity needs and confirmed
            targets.
          </p>
        </Link>
        <Link className="fk-action" href="/privacy">
          <h3>Your data, explained</h3>
          <p>Review how statements and account information are handled.</p>
        </Link>
      </div>
    </AppLayout>
  );
}
