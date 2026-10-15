# Trust foundation — implementation and remaining work

Benchmarking track added 14 October 2026: [lawful competitor/open-source review and PR plan](benchmarking/report.html), [pinned evidence and license registry](benchmarking/registry.json), and [planned acceptance matrix](benchmarking/acceptance.csv). This documentation-only track preserves the phase order below and adds no production changes. External code reuse, provider access and each implementation release require their recorded review gates; no merge or deployment is authorized without review.

Date: 13 October 2026. Baseline: `ccc9a54` (15 June 2026). No new commits in the preceding approximately three months; production still served that baseline during the audit. This release addresses security and misleading output. It does not finish the Dezerve-class product roadmap.

Verification update: 25 automated checks pass, including an empty Supabase preview and safe migration replay. GitHub quality checks and Supabase Preview pass. The owner applied the reviewed migration through Supabase's SQL editor; read-only verification confirmed all 19 existing holdings remain, all five active portfolio tables have RLS, obsolete public OTP/nutrition access is denied, and all three RPCs are security-invoker with anonymous execution denied. Preview public Supabase configuration is scoped to this branch's isolated database; production connection settings are unchanged.

## Implemented

| Problem | Change | Main files |
| --- | --- | --- |
| Custom OTP login exposed bearer credentials; inconsistent auth guards | Retire custom endpoint; one Supabase SSR proxy and callback; same-origin writes | `src/proxy.ts`, `src/app/auth/callback/route.ts`, `src/app/api/auth-otp/route.ts`, `src/lib/server/http.ts` |
| Public OTP/unrelated table policies | Revoke obsolete client grants and policies; preserve records | `supabase/migrations/20261013112245_trust_foundation.sql` |
| Service-role writes trusted supplied owner IDs; destructive delete/insert | Owner session, preview and one transactional security-invoker commit | `src/lib/server/imports.ts`, `src/app/api/portfolio/import/commit/route.ts` |
| Same scheme across folios collided; purchase dates and missing values invented | Folio identity, exact scheme IDs, strict normalization, nullable unknowns | `src/lib/portfolio/import.ts`, `src/components/ImportPortfolio.tsx` |
| Fake dashboard returns, charts and health scores | Actual holdings with dates, coverage and unavailable states | `src/components/PortfolioOverview.tsx`, `src/lib/portfolio/insights.ts` |
| NAV fuzzy matching and wrong legacy table | Exact AMFI identifiers, source dates, owned updates and observations | `src/lib/portfolio/nav.ts`, `src/app/api/nav-refresh/route.ts` |
| Sample AI, market, tax and fund recommendations | Retired APIs and explicit unavailable feature screens | `src/components/Unavailable.tsx`, affected `src/app/*/page.tsx` |
| Unsafe spreadsheet dependency and vulnerable runtime | Remove unused parsers and demo code; update Next/Supabase; pinned CI actions | `package.json`, `package-lock.json`, `.github/workflows/quality.yml` |

The current import is a **statement snapshot**, not a complete accounting ledger. Source cost can differ from lifetime cash invested. Widget output is user-submitted provider data, not independently verified. Existing legacy values were preserved; their provenance and purchase dates cannot be reconstructed. New imports eliminate invented defaults. Only exact dated matches refresh NAV; missing mappings remain unresolved.

## Release blockers and acceptance matrix

| Area | Required acceptance | Evidence/status |
| --- | --- | --- |
| Type safety/build | All routes compile and lint | `npm run check`, `npm run build`; record final release results |
| Import calculations | Unknown remains null; zero retained; invalid dates/numbers fail; units/NAV reconcile | Automated synthetic fixtures |
| Database isolation | A cannot read/write/commit/refresh B; public OTP access denied | Embedded PostgreSQL tests against actual migration |
| Import safety | Failure after delete rolls back; retry idempotent; distinct folios preserved | Embedded PostgreSQL tests |
| Cost protection | Durable quota rejects sixth request; users cannot erase usage | Embedded PostgreSQL tests |
| Production migration | Existing 19 holdings retained; grants/RLS/RPCs verified | Verified on 13 October 2026 after owner applied SQL |
| Production anonymous access | Private pages redirect; private APIs 401; retired APIs 410 | HTTP/browser release checks |
| Supabase login | Real Google and magic-link login, callback cookies, logout, expiry, redirects | Requires interactive account test; not proven by a build |
| CASParser | Revoke exposed key, configure new name, incorrect password, timeout, large file, real statement preview/commit | Owner authorized temporary testing with the existing key; rotation and real-statement acceptance remain outstanding |
| Responsive UI | Public pages at desktop/mobile; signed-in upload/table/navigation at mobile | Public browser check plus signed-in follow-up required |
| Jev | No key means no call; invalid/failing output unavailable; low confidence requires review | Mock tests only; adapter not connected |
| Dependency security | No high/critical runtime advisories | Runtime audit; dev-only braces chain remains subject to upstream fix |
| Operations | Provider failures/freshness alerts, restoration drill and incident runbook | Partial: bounded errors/quotas; monitoring and recovery drill still required |

Historical exposed Resend/CASParser credentials remain an external risk until revoked. Source cleanup does not rotate them. The owner subsequently authorized temporary testing before rotation. `FOLIOKEY_CAS_TEST_EXPIRES_AT` now permits the existing server-side key only until an explicit deadline; missing/invalid/expired deadlines disable that fallback, and a replacement key always takes precedence. Real CAS end-to-end acceptance still requires a consented user upload and source reconciliation. Supabase leaked-password protection was disabled at audit time; the app uses OAuth/magic links, but project-level password settings should be reviewed before offering passwords.

## Phased implementation plan

1. **Secure upload pilot (P0).** Rotate provider keys; verify Google and email auth on production; run one consented CAS through preview, replacement and replay; compare each folio, units, cost and value to source. Test rejection without losing prior holdings. Add provider incident/freshness metrics without financial or identity payloads. Finalize retention/deletion and provider processing disclosures. Files: importer/routes/UI above, `src/app/privacy/page.tsx`, new owner deletion workflow. Exit: real-account acceptance complete, restoration drill passed.
2. **Reconciled financial engine (P1).** Establish licensed scheme master and daily NAV history with ISIN-to-plan/option mappings and provenance. Build source references with a lawful retention policy, deduplicated signed cashflows, opening balances, transfers, switches, splits and payouts. Add deterministic XIRR with convergence/ambiguity checks; separate investment return from portfolio market value and flows. Do not annualize a guessed start date. New modules: `src/lib/portfolio/ledger.ts`, `performance.ts`; migrations for reconciled lots/cashflows/benchmark history; `/api/portfolio/performance`. Independent cashflow fixtures and hand-verified reference results must precede UI charts.
3. **Consent-based aggregation (P1).** Select and contract an authorized MF/Account Aggregator/RTA provider supporting the required coverage. Validate actual mobile/PAN/OTP/consent requirements, expiry, revoke/delete, retries and signed webhooks. Preserve Supabase identity; provider consent is a linked resource, never a second auth system. Extend `/connect`, add `/api/connections/*`, connection jobs and audit events. Exit: account ownership, all folios, stale/partial responses, duplicates and consent revocation tested. Mobile number alone must never be advertised as sufficient without provider evidence.
4. **Explainable fund intelligence (P2).** Ingest source-dated fund facts, expense ratios, category benchmarks, holdings overlap, downside/rolling risk, mandate and manager changes. Collect horizon, liquidity needs and risk capacity. First exclude unsuitable/unavailable/stale candidates, then score within comparable categories with documented weights, reasons and sensitivity. Validate out of sample without survivorship/look-ahead bias. New `src/lib/intelligence/{eligibility,features,ranking,explanations}.ts`; extend `/api/intelligence` and `/intelligence`. Jev may classify cited public research after an evaluation; deterministic code owns financial arithmetic and suitability constraints. No universal “best fund”, guarantees or opaque scores.
5. **Planning and monetization (P2/P3).** Implement goals/SIPs and transactions on reconciled data, then direct-vs-regular analysis, tax lots and rebalance scenarios with current verified tax rules, exit loads and user constraints. Restore currently unavailable routes only when backed by tested providers. Define advisory/compliance operating model before personalized recommendations, order execution or charging. Add billing entitlements/webhook replay/refund handling only after value is validated; no placeholder paid benefits. Add accessibility/signed-in mobile regression tests, database baselines, backups, alert ownership and deployment gates.

## Provider references

- [CASParser response schema](https://casparser.in/docs/learn/response-schema)
- [CASParser CDSL fetch prerequisites](https://casparser.in/docs/guides/cdsl-fetch)
- [CASParser SDK configuration](https://casparser.in/docs/sdk/configuration)
- [TypeSafe API documentation](https://api.typesafe.ai/docs)

Provider documentation describes contracts, not proof that this account's credentials, subscription, quotas or real investor data work. End-to-end verification remains a separate release gate.
