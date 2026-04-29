# 🔧 FolioIQ Environment Setup Guide

## What You Have (3/6) ✅
- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY  
- [x] ANTHROPIC_API_KEY

## What You're Missing (3/6) ❌
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] CLERK_SECRET_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

---

## Step 1: Get SUPABASE_SERVICE_ROLE_KEY (2 minutes)

You already have Supabase set up, just need the service role key:

1. Go to https://app.supabase.com
2. Select your project
3. Left sidebar → Project Settings → API
4. Under "Project API keys", copy the **service_role key** (NOT the anon key)
   - It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This key bypasses RLS - keep it secret!

Paste it as:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: Get CLERK Keys (5 minutes)

Clerk handles all authentication (login, signup, sessions):

### 2A. Create Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up with Google/GitHub
3. Create a new application
4. Name it "FolioIQ"

### 2B. Get Your Keys
In the Clerk dashboard:
1. Left sidebar → API Keys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2C. Configure Redirect URLs
In Clerk dashboard:
1. Go to Configure → URLs
2. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### 2D. Configure OAuth (Optional - for Google login)
1. Configure → Social Connections
2. Enable Google
3. Follow the Google OAuth setup (takes 2 mins)

Paste keys as:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## Step 3: Verify Your .env.local

Your final file should look like this:

```env
# Supabase (You have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk (New - get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Anthropic (You have this)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Step 4: Quick Test

After filling in all values:

```bash
# 1. Restart your dev server
npm run dev

# 2. Open http://localhost:3000
# 3. Click "Get Started" → should show Clerk sign-up modal
# 4. Sign up with email → should redirect to /dashboard
# 5. Upload a CAS file → should save to Supabase
```

---

## Troubleshooting

### "Clerk keys are missing"
→ You forgot to add CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY

### "Unauthorized" when uploading
→ Check that SUPABASE_SERVICE_ROLE_KEY is set (not just ANON_KEY)

### "Table 'holdings' does not exist"
→ Run the SQL from `supabase-schema.sql` in Supabase SQL Editor

### "RLS violation"
→ The service_role key bypasses RLS. If using anon key, you need to set up RLS policies properly.

---

## Optional: Production Checklist

Before going live, also get:

| Service | Purpose | Cost |
|---------|---------|------|
| Clerk Production | Live auth | Free tier: 10K MAU |
| Supabase Production | Live database | Free tier: 500MB |
| Resend | Email alerts | Free: 100 emails/day |
| PostHog | Analytics | Free: 1M events/month |

---

## Need Help?

- Clerk docs: https://clerk.com/docs
- Supabase docs: https://supabase.com/docs
- FolioIQ issues: Open a GitHub issue
