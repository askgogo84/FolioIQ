# Phase 1 containment

Baseline: `a6728b0` on main. The older audit baseline `ccc9a54` has already been superseded by merged trust-foundation and temporary-upload PRs. This change preserves the safe foundation and closes the temporary upload/token paths required by the current containment scope.

## Current behavior

- `/api/auth-otp`, `/api/upload`, `/api/upload-portfolio`, `/api/cas-parse`, `/api/pf/load`, `/api/pf/save`, `/api/supabase-test` return 410 for GET/POST. The provider session-token route `/api/casparser/token` also returns 410. No auth, database, model or provider operation runs in these handlers.
- Existing `/api/claude`, `/api/ai/insights`, and `/api/upload-handler` remain retired. Personal model advice remains unavailable. No caller-supplied model/system/token limits are accepted by an active model proxy.
- `/upload` and `/connect` explain that imports are paused. The provider widget, browser-token handling, temporary credential-selection helper and unused SDK dependency are removed. No document/password/OTP is collected on those pages.
- The canonical normalization, RLS-backed staging and transactional commit foundation remains. Staging derives ownership from the verified session, has a durable budget gate, and validates input before writes. It does not prove provider authenticity; the source remains user-submitted snapshot data. No import or database operation was performed during this implementation.
- One SSR proxy protects all nonpublic pages, including the requested finance/account pages. OAuth callback/session paths are exempt; refreshed cookies survive both sign-in redirects. Native Google OAuth and email magic-link sign-in preserve a safe internal return path. Expired/error and anonymous Supabase sessions are rejected for private operations.
- Dashboard/holdings show Mutual Fund Portfolio Value, reported remaining cost and unrealized holding gain. Missing/partial totals are unavailable. Unknown/mixed dates stay visible; at least one valuation older than seven calendar days explicitly marks the snapshot stale. This threshold is a warning, not a publication SLA.
- Allocation Insights remains deterministic observations. Allocation Drift Simulator and Imported SIP Amounts remain unavailable rather than issuing advice or claiming verified schedules. Tax/goals/watchlist/live-NAV/risk/chat continue to show unavailable states inherited from main. The old comparison view is also paused because it substituted missing values with zero.
- Historical charts, XIRR, health scores, fictional portfolio context and random sparklines are not restored.

## Review and release boundaries

No production schema migration, credential rotation, provider request, merge or deployment is included. Vercel automatic deployment is disabled specifically for `fix/phase1-containment` through `git.deploymentEnabled`; other branches are unchanged. This lets the draft PR be reviewed without publishing the branch. Review any separate external automation before release; only the existing quality workflow is configured in this repository.

The database migration already on main is exercised only in an isolated embedded PostgreSQL test environment. Historical trust-foundation notes report that the owner previously applied it; this PR does not independently certify current production policies. Before release, recheck RLS/grants/RPC isolation read-only and verify previously exposed Resend/CASParser keys have been revoked externally. Source cleanup cannot revoke historical credentials.

## Remaining Phase 1 blockers

1. Real-account Google and magic-link acceptance, including redirect configuration, callback cookies, refresh, logout and expired links. Automated tests verify local session/route behavior with mocked Auth only.
2. Current production RLS/grants and credential-revocation verification. No production database reads or writes are needed to run this PR's tests.
3. A reviewed server-side canonical import transport with no browser provider token, consent and reconciliation acceptance before imports can be reopened. Preserve unknown fields and transaction coverage; never manufacture dates/units/costs.
4. Reconcile legacy holdings against consented source statements; old invented facts cannot be reconstructed by a code change.
5. Signed-in mobile/browser acceptance, incident/freshness monitoring, restoration drill, retention/deletion workflow and privacy review.
6. Historical NAV/ledger performance remains unavailable. New Dezerv-style intelligence is outside this PR.

## Verification

`npm ci`, `npx tsc --noEmit`, `npm test`, `npm run lint`, and a production build with synthetic loopback Supabase configuration are the required local checks. Tests cover page/matcher protection, callback exemption and refresh-cookie propagation, error/anonymous sessions, retired-route bodies, unavailable chat, session-derived import ownership, budgets blocking staging, absent fictional context/privileged caller-ID writes, and empty/stale/partial snapshots. Existing tests cover import normalization, missing/zero values and dates, RLS isolation, atomic rollback, retries, folios, NAV ownership and persistent quotas in embedded PostgreSQL. Provider tests use mocks exclusively. Record final counts and results in the draft PR; a green build is not evidence of real-account/provider acceptance.
