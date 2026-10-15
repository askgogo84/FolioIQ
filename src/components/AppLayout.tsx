"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
const links = [
  ["/dashboard", "Overview"],
  ["/portfolio", "Holdings"],
  ["/upload", "Import portfolio"],
  ["/connect", "Connect with OTP"],
  ["/transactions", "Transactions"],
  ["/intelligence", "Portfolio insights"],
  ["/sips", "SIP readiness"],
  ["/rebalance", "Rebalance readiness"],
  ["/chat", "Portfolio guide"],
  ["/calculator", "SIP calculator"],
  ["/profile", "Profile"],
];
export default function AppLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const current = usePathname(),
    router = useRouter();
  const [theme, setTheme] = useState("light"),
    [error, setError] = useState("");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("folioiq-theme");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize a persisted browser preference after hydration.
    setTheme(saved === "dark" ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      saved === "dark" ? "dark" : "light",
    );
  }, []);
  function toggle() {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("folioiq-theme", next);
    } catch {}
  }
  async function logout() {
    const { error } = await createClient().auth.signOut();
    if (error) {
      setError("Sign out failed. Please retry.");
      return;
    }
    router.replace("/auth");
    router.refresh();
  }
  return (
    <div className="trust-shell">
      <a href="#content" className="trust-skip">
        Skip to content
      </a>
      <aside className="trust-sidebar">
        <Link href="/dashboard" className="trust-brand">
          FolioKey<span>Portfolio intelligence</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={current === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="trust-footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <button onClick={logout}>Sign out</button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className="trust-column">
        <header className="trust-top">
          <Link href="/dashboard" className="trust-brand">
            FolioKey
          </Link>
          <span>YOUR WEALTH, WITH PERSPECTIVE</span>
          <details className="fk-mobile-menu">
            <summary>Explore</summary>
            <nav aria-label="All workspace pages">
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={current === href ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
              <button onClick={logout}>Sign out</button>
            </nav>
          </details>
          <button onClick={toggle} aria-label="Toggle color theme">
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>
          <Link href="/upload" className="trust-button">
            Import portfolio
          </Link>
        </header>
        <main id="content" className="trust-main">
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
          {children}
        </main>
      </div>
      <nav className="trust-bottom" aria-label="Mobile navigation">
        {[links[0], links[1], links[2], links[5], links[links.length - 1]].map(
          ([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={current === href ? "page" : undefined}
            >
              {label.replace(" portfolio", "")}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
