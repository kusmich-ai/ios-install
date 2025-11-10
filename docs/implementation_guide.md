# IOS AUTHENTICATION IMPLEMENTATION GUIDE

## 🎯 PHASE 1A: BASIC AUTH - COMPLETE SETUP INSTRUCTIONS

This document walks you through implementing authentication before baseline assessment.

---

## 📋 PREREQUISITES

1. **Supabase Project**: You need a Supabase project set up
2. **Next.js App**: Running Next.js 13+ with App Router
3. **Dependencies**: Install required packages

---

## 🚀 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Install Dependencies

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### STEP 2: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase_migration.sql` (created in this session)
4. Paste and run it in the SQL Editor
5. Verify tables were created:
   - `user_profiles`
   - `user_subscriptions`
   - `baseline_assessments`
   - `user_progress`
   - `practice_logs`
   - `weekly_deltas`

6. **Verify triggers are working:**
   - Go to Authentication → Users
   - Create a test user manually
   - Check Database → Tables → `user_profiles`, `user_subscriptions`, `user_progress`
   - Confirm automatic rows were created for the test user

### STEP 3: Configure Supabase Auth Settings

1. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `http://localhost:3000` (or your production URL)
   - **Redirect URLs**: Add these:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
     - Your production URLs when deploying

2. In Authentication → Providers:
   - Enable **Email** provider
   - Configure email templates (optional but recommended):
     - Confirmation email
     - Password reset email
     - Magic link email (for future)

3. In Authentication → Settings:
   - **Confirm email**: Toggle ON (recommended) or OFF (for testing)
   - **Secure password**: Keep default requirements

### STEP 4: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Get your Supabase credentials:
   - Go to Supabase Dashboard → Settings → API
   - Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_PAYMENT_REQUIRED=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### STEP 5: Update Your App Structure

Your app should have this structure:

```
app/
├── auth/
│   ├── signin/page.tsx         ✅ Created
│   ├── signup/page.tsx         ✅ Created
│   ├── forgot-password/page.tsx ✅ Created
│   ├── reset-password/page.tsx  ✅ Created
│   └── callback/route.ts        ✅ Created
├── assessment/
│   └── page.tsx                 ⚠️ NEEDS UPDATE (Step 6)
├── chat/
│   └── page.tsx                 ⚠️ NEEDS UPDATE (Step 7)
└── page.tsx                     ⚠️ NEEDS UPDATE (Step 8)

middleware.ts                    ✅ Created
lib/
└── subscription.ts              ✅ Created
```

### STEP 6: Update Assessment Page

**Before (old anonymous system):**
```typescript
// Saved to localStorage with anonymous ID
```

**After (new authenticated system):**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Assessment() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Check if user already completed baseline
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (baseline) {
        // Already completed - redirect to chat
        router.push('/chat');
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Your existing assessment UI here
  return (
    <div>
      {/* YOUR BASELINE ASSESSMENT ORCHESTRATOR */}
      {/* When assessment completes, save to Supabase instead of localStorage */}
    </div>
  );
}
```

**KEY CHANGE: Save baseline results to Supabase**

When assessment completes, instead of localStorage:

```typescript
// OLD: Don't do this anymore
// await window.storage.set('baseline:calm_core', score);

// NEW: Save to Supabase
const { error } = await supabase
  .from('baseline_assessments')
  .insert({
    user_id: user.id,
    calm_core_score: calmCoreScore,
    observer_index_score: observerIndexScore,
    vitality_index_score: vitalityIndexScore,
    focus_diagnostic_score: focusDiagnosticScore,
    presence_test_score: presenceTestScore,
    regulation_domain: (calmCoreScore) / 1, // since only one assessment
    awareness_domain: (observerIndexScore) / 1,
    outlook_domain: (vitalityIndexScore) / 1,
    attention_domain: (focusDiagnosticScore + presenceTestScore) / 2,
    rewired_index: calculatedREwiredIndex, // 0-100 scale
    rewired_tier: determineTier(calculatedREwiredIndex),
    presence_test_elapsed_seconds: elapsedSeconds,
    presence_test_cycles_completed: cyclesCompleted,
  });

if (!error) {
  // Redirect to chat after successful save
  router.push('/chat');
}
```

### STEP 7: Update Chat Page

Add auth check at the top:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [baseline, setBaseline] = useState<any>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Load baseline data
      const { data: baselineData } = await supabase
        .from('baseline_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (!baselineData) {
        // No baseline yet - redirect to assessment
        router.push('/assessment');
        return;
      }

      setUser(user);
      setBaseline(baselineData);
      setLoading(false);
    }

    loadUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Your existing chat UI here
  // Now you have access to:
  // - user.id for Supabase queries
  // - baseline.rewired_index, baseline.regulation_domain, etc.
  
  return (
    <div>
      {/* YOUR IOS CHAT INTERFACE */}
      {/* Use user.id instead of localStorage user_id for all data queries */}
    </div>
  );
}
```

### STEP 8: Create Landing Page (Homepage)

```typescript
// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-6xl font-bold mb-6" style={{ color: '#ff9e19' }}>
          IOS System
        </h1>
        <p className="text-2xl text-gray-300 mb-4">
          Integrated Operating System
        </p>
        <p className="text-lg text-gray-400 mb-12">
          A neural and mental transformation protocol that rewires how you regulate, think, and perform.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            style={{ backgroundColor: '#ff9e19', color: '#0a0a0a' }}
          >
            Start Free Trial
          </Link>
          
          <Link
            href="/auth/signin"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            style={{ backgroundColor: '#111111', color: '#ff9e19', border: '1px solid #ff9e19' }}
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          7-day free trial • No credit card required
        </p>
      </div>
    </div>
  );
}
```

---

## 🧪 TESTING CHECKLIST

### Test 1: Sign Up Flow
- [ ] Visit `/auth/signup`
- [ ] Create account with email/password
- [ ] Check email for confirmation (if enabled)
- [ ] Confirm redirects to `/assessment` after signup
- [ ] Verify user exists in Supabase Auth dashboard
- [ ] Verify `user_profiles`, `user_subscriptions`, `user_progress` rows created automatically

### Test 2: Sign In Flow
- [ ] Visit `/auth/signin`
- [ ] Sign in with created account
- [ ] If no baseline: redirects to `/assessment`
- [ ] If has baseline: redirects to `/chat`

### Test 3: Baseline Assessment
- [ ] Complete full baseline assessment
- [ ] Verify data saves to Supabase `baseline_assessments` table
- [ ] Verify redirect to `/chat` after completion

### Test 4: Forgot Password Flow
- [ ] Visit `/auth/forgot-password`
- [ ] Enter email
- [ ] Check email for reset link
- [ ] Click link, set new password
- [ ] Verify can sign in with new password

### Test 5: Protected Routes
- [ ] Sign out
- [ ] Try accessing `/chat` - should redirect to `/auth/signin`
- [ ] Try accessing `/assessment` - should redirect to `/auth/signin`
- [ ] Sign in - should redirect to appropriate page based on progress

### Test 6: Subscription Status (MVP Mode)
- [ ] Verify `checkSubscriptionStatus()` returns `hasAccess: true` (MVP mode)
- [ ] User can access all features without payment

---

## 🔧 TROUBLESHOOTING

### Issue: "Invalid Refresh Token"
**Fix**: Clear browser cookies/localStorage, sign out, sign in again

### Issue: Redirects not working
**Fix**: Check middleware.ts is in root directory, verify matcher config

### Issue: Email confirmation not received
**Fix**: 
1. Check Supabase → Authentication → Settings → Email templates
2. Check spam folder
3. For testing: Disable email confirmation in Auth settings

### Issue: Row Level Security errors
**Fix**: Verify RLS policies are enabled and correct in Supabase

### Issue: Trigger not creating profile/subscription
**Fix**: 
1. Check SQL Editor for error messages
2. Manually create test user in Auth
3. Check if rows appear in user_profiles, user_subscriptions, user_progress

---

## 📦 FILES CREATED THIS SESSION

All these files are ready to copy to your project:

1. ✅ `supabase_migration.sql` - Database schema
2. ✅ `lib/subscription.ts` - Subscription checking logic
3. ✅ `middleware.ts` - Route protection
4. ✅ `app/auth/signin/page.tsx` - Sign in page
5. ✅ `app/auth/signup/page.tsx` - Sign up page
6. ✅ `app/auth/forgot-password/page.tsx` - Forgot password
7. ✅ `app/auth/reset-password/page.tsx` - Reset password
8. ✅ `app/auth/callback/route.ts` - Email confirmation handler
9. ✅ `.env.local.example` - Environment variables template

---

## 🎯 NEXT STEPS AFTER IMPLEMENTATION

### Immediate (This Week)
- [ ] Deploy to Vercel/production
- [ ] Test full auth flow in production
- [ ] Set up custom email domain (optional)

### Short Term (Next 2-4 Weeks)
- [ ] Add Google OAuth (Phase 2)
- [ ] Implement magic link signin
- [ ] Add user settings page (update profile, change password)

### Before Launch (When Ready for Payment)
1. **Stripe Integration**:
   - Install Stripe SDK
   - Create pricing page
   - Implement checkout flow
   - Add webhooks for subscription events

2. **Enable Payment Requirement**:
   - Set `NEXT_PUBLIC_PAYMENT_REQUIRED=true` in .env
   - Test trial expiration logic
   - Test subscription renewal

3. **User Flow Changes**:
   - Landing → Sign Up → **Payment** → Assessment → Chat
   - Or: Landing → Sign Up → Assessment (trial) → **Payment Required after 7 days** → Chat

---

## 💡 DESIGN DECISIONS EXPLAINED

### Why Auth BEFORE Baseline?
- Prevents data loss if user closes browser
- Better user lifecycle management
- Easier to add payment gate later
- Clean email collection for marketing

### Why Trial by Default?
- Lower barrier to entry
- Users can experience value before paying
- Easy to grandfather in beta testers
- Stripe handles trial period automatically

### Why Supabase user.id Instead of Anonymous IDs?
- Reliable identity across devices
- No orphaned data
- Built-in security with RLS
- Easy to link with Stripe customer IDs

---

## 🚨 IMPORTANT NOTES

### Security
- Never commit `.env.local` to git
- Use environment variables for all secrets
- RLS policies are critical - don't disable them
- Always validate user input server-side

### Data Migration
- If you have existing test users with localStorage data:
  - Create migration script to import to Supabase
  - Or start fresh (recommended for MVP)

### Email Deliverability
- For production: Use custom email domain (Supabase supports SendGrid, AWS SES)
- For testing: Supabase's default emails may go to spam

---

## 📞 NEED HELP?

If you encounter issues:
1. Check Supabase logs (Database → Logs)
2. Check browser console for errors
3. Verify .env variables are set correctly
4. Test auth flow step-by-step with console.log()

Ready to implement! Let me know if you have questions about any step.
