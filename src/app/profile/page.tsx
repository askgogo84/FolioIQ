"use client";
import { useEffect, useState } from "react";
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
      });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().auth.updateUser({
      data: { full_name: name.trim(), onboarding_completed: true },
    });
    setMessage(
      error
        ? "Your profile could not be saved. Please retry."
        : "Profile saved.",
    );
    setBusy(false);
  }
  return (
    <AppLayout>
      <h1>Your profile.</h1>
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
    </AppLayout>
  );
}
