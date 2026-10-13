# FolioKey

Mutual fund statement review built with Next.js, Supabase Auth/Postgres and CASParser. The charcoal/lime and ivory/forest themes remain the product design language.

## Current capability

- Supabase Google OAuth and email magic links; user-scoped database access.
- Existing owner-scoped holdings, dated exact-identifier NAV refresh and imported transaction records.
- Missing values remain unavailable. Historical performance, XIRR, tax, goals, fund ranking and personal advice remain unavailable.
- New uploads and provider connections are paused. Legacy uploads and the provider-token endpoint return 410; no provider session token is issued to browsers.
- The validated staging/atomic-commit foundation remains, with session-derived ownership and durable quotas. It is not advertised as a working upload flow.

Previously exposed CASParser and Resend credentials still require revocation in their provider dashboards. This release removes the temporary credential test window; source cleanup does not revoke credentials or erase history. No production database change is included. See `docs/phase1-containment.md` for the current scope and review gates.

## Local development and checks

Use Node.js 24 and `npm ci`. Copy `.env.example` to `.env.local`, configure your own Supabase project, then `npm run dev`. Never commit secrets, statements or real customer fixtures. The app does not need a service-role credential for normal requests.

Run `npm run check` (TypeScript, node tests, ESLint), `npm audit --omit=dev --audit-level=high`, and `npm run build`. Tests use synthetic statements, mocked providers and an isolated embedded PostgreSQL database, never production customer records. CI runs these checks without production secrets. Vercel's Git integration builds deployments; CI does not publish them.

## Database and deployment

Production is Vercel project **foliokey**, domains **foliokey.app / www.foliokey.app**, with Supabase project **hvuqwfpcumooegflfrth**. Verify these targets and the exact commit before releasing. The similarly named Vercel project `folioiq` is not the production target.

`supabase/migrations/20261013112245_trust_foundation.sql` upgrades the inspected existing production schema and bootstraps the active portfolio tables in an empty Supabase preview. Tests cover both the legacy baseline and empty/replayed migration paths. Supabase supplies the auth schema; no customer data is copied to previews. The former destructive `supabase/schema.sql` and invalid `supabase_fix.sql` scripts are retired; their historical contents remain in Git history.

Apply the migration before deploying the matching app. It preserves existing holdings and unrelated table data, revokes obsolete public access, creates owner-scoped import/transaction/NAV evidence tables, and adds security-invoker RPCs. Verify row counts, RLS, grants and advisors afterward. Import replacement saves the previous snapshot in `portfolio_imports.previous_holdings` inside the same transaction; use a reviewed owner-specific recovery procedure if restoration is needed. Never replay the old destructive schema script.

For rollback, keep the additive schema. Do not restore the old vulnerable auth/import routes. Roll forward with provider features disabled if a regression occurs. Confirm production's Supabase URL/key, OAuth redirect allowlist and email templates. Email links must deliver either a PKCE code or a `token_hash` compatible with `/auth/callback`. No login or consent OTP belongs in logs.

## Provider configuration

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public client configuration; session authorization still relies on Supabase and RLS.
- `FOLIOKEY_CAS_PARSER_API_KEY`: new server-only CASParser credential. Add the replacement in Vercel's correct environment and redeploy. It takes precedence over any temporary test configuration.
- `FOLIOKEY_CAS_TEST_EXPIRES_AT`: optional, owner-authorized test deadline, such as an ISO UTC timestamp ending in `Z`. Before the deadline, the existing server-side `CAS_PARSER_API_KEY` can be used. Missing, invalid or expired deadlines disable this fallback on every request. Production's test window is limited to 24 hours when configured; authentication, consent, quotas and preview confirmation remain required. This is not a substitute for rotating the exposed credential.
- Manual NAV refresh uses AMFI's dated public feed. Scheduled refresh is disabled until a scoped worker, retry monitoring and freshness alerts are implemented.
- Jev/TypeSafe: `src/lib/providers/jev.ts` is an **unwired optional adapter**, tested with mocks. It accepts an explicit key and model when called by future server code. It currently sends no requests and no customer data. It only classifies public research; it is not a return calculator, suitability engine or fund selector. Do not add an API key until this use case and model have been evaluated.

Provider connection is not universal mobile-number retrieval. CASParser's CDSL flow requires PAN, birth date and a CDSL account identifier as well as OTP. This release imports supported non-demat mutual fund folios only. Full mobile/OTP aggregation requires a separately approved provider/consent integration and reconciliation tests.

See [implementation status and acceptance gates](docs/trust-foundation.md) before describing this release as ready for customer uploads or investment recommendations.
