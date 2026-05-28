# FolioKey Security Rules

- Never log PAN numbers, Aadhaar, or CAS file contents
- Supabase RLS must be enabled on all tables — never bypass
- CDSL OTP flows must not cache or log OTP values
- Never hardcode ANTHROPIC_API_KEY or SUPABASE service role key
- CASParser API key must only be used server-side, never in client code
