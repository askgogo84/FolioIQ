// Smooth scrolling must never reach the app surface.
//
// The risk is not "Lenis is broken" — it is that someone adds a route to the
// allowlist, or flips it to a blocklist, and a holdings table starts hijacking
// the wheel. That is a one-line change in a file nobody reads twice.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { isSmoothRoute } from '../src/components/scroll/smooth-scroll';

const SRC = 'src/components/scroll/smooth-scroll.tsx';
const src = fs.readFileSync(SRC, 'utf8');

test('route gating is an allowlist, not a blocklist', () => {
  assert.match(src, /const SMOOTH_ROUTES: ReadonlySet<string>/);
  assert.doesNotMatch(src, /BLOCK(ED)?_ROUTES|EXCLUDE_ROUTES/);
});

test('marketing routes are smoothed', () => {
  for (const r of ['/', '/pricing', '/privacy', '/terms']) {
    assert.equal(isSmoothRoute(r), true, `${r} should be smoothed`);
  }
});

test('app, table and workflow routes keep native scrolling', () => {
  const native = [
    '/auth', '/profile',
    '/portfolio', '/watchlist', '/transactions', '/sips', '/reports',
    '/screener', '/explore', '/backtest', '/market', '/live-nav',
    '/rebalance', '/risk', '/risk-profile', '/tax-harvesting',
    '/direct-vs-regular', '/upload', '/connect',
    // routes that do not exist yet: the allowlist must fail closed
    '/portfolio/holdings', '/reports/2026',
  ];
  for (const r of native) {
    assert.equal(isSmoothRoute(r), false, `${r} must keep native scrolling`);
  }
});

test('near-miss and empty pathnames are not smoothed', () => {
  assert.equal(isSmoothRoute('/pricingx'), false);
  assert.equal(isSmoothRoute(''), false);
  assert.equal(isSmoothRoute(null), false);
  assert.equal(isSmoothRoute(undefined), false);
});

test('guard rails are present', () => {
  assert.match(src, /prefers-reduced-motion: reduce/);
  assert.match(src, /if \(mq\?\.matches\) return/);
  assert.match(src, /SCROLLABLE_THRESHOLD_PX/);
  assert.match(src, /syncTouch: false/);
  assert.match(src, /allowNestedScroll: true/);
  assert.match(src, /autoRaf: true/);
  assert.match(src, /lenis'\) === 'off'/);
  assert.match(src, /lenis\?\.destroy\(\)/);
  assert.doesNotMatch(src, /requestAnimationFrame/);
});
