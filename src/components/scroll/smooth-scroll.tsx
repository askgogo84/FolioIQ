'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * Smooth scrolling for marketing/storytelling routes only.
 *
 * WHY AN ALLOWLIST AND NOT A BLOCKLIST
 * ------------------------------------
 * A blocklist fails open: the day someone adds /dashboard/reports, it silently
 * inherits hijacked scrolling and nobody notices until a customer reports that
 * a table "jumps". An allowlist fails closed — a new route gets native
 * scrolling until somebody deliberately opts it in. For a product that is
 * mostly portfolio tables, screeners and backtests, that is the only safe
 * default.
 *
 * Explicitly NOT smoothed, by omission: /auth, every portfolio and holdings
 * table, /screener, /backtest, /explore, /market, /live-nav, /reports,
 * /rebalance, /transactions, /sips, the risk and tax flows, /upload and
 * /connect, plus any nested scroll container inside them.
 *
 * WHY NO SECOND ANIMATION LOOP
 * ----------------------------
 * `autoRaf: true` lets Lenis drive its own rAF. Nothing here adds a ticker, so
 * there is exactly one loop while it is mounted and none at all once it is not.
 */

/** Exact pathnames that get smooth scrolling. Keep this short and deliberate. */
const SMOOTH_ROUTES: ReadonlySet<string> = new Set<string>(['/', '/pricing', '/privacy', '/terms']);

/**
 * Prefix opt-ins, for marketing sections with child routes. Kept separate from
 * the exact set so a prefix can never accidentally swallow an app route.
 */
const SMOOTH_PREFIXES: readonly string[] = [];

export function isSmoothRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (SMOOTH_ROUTES.has(pathname)) return true;
  return SMOOTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSmoothRoute(pathname)) return;

    // Escape hatch: ?lenis=off reproduces a scroll bug against native behaviour
    // without needing a deploy.
    try {
      if (new URLSearchParams(window.location.search).get('lenis') === 'off') return;
    } catch {
      /* no URLSearchParams is not a reason to bail */
    }

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    if (mq?.matches) return; // never construct Lenis under reduced motion

    // Nothing to smooth: don't pay for a rAF loop on a page that does not
    // scroll. Re-checked on every navigation, so a page that only exceeds one
    // viewport at some breakpoints behaves correctly at all of them.
    const SCROLLABLE_THRESHOLD_PX = 120;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable < SCROLLABLE_THRESHOLD_PX) return;

    // Clear a fixed header if there is one, measured rather than hard-coded.
    const header = document.querySelector<HTMLElement>('[data-site-header], header');
    const offset = header ? -(Math.round(header.getBoundingClientRect().height) + 12) : 0;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        syncTouch: false, // touch scrolling stays entirely native on mobile
        allowNestedScroll: true, // nested scrollers keep their own scrolling
        overscroll: true,
        anchors: offset ? { offset } : true,
      });
    } catch {
      return; // fall back to native scrolling, never to a broken page
    }

    const teardown = () => {
      lenis?.destroy();
      lenis = null;
    };
    // Reduced motion can be switched on while the page is open.
    const onPrefChange = (e: MediaQueryListEvent) => {
      if (e.matches) teardown();
    };
    mq?.addEventListener?.('change', onPrefChange);

    return () => {
      mq?.removeEventListener?.('change', onPrefChange);
      teardown();
    };
    // Re-evaluated on every navigation, so leaving an allowlisted route tears
    // Lenis down rather than carrying it into the app shell.
  }, [pathname]);

  return null;
}
