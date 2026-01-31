

## Plan: Authentication & Dashboard Restructuring

### Overview
This plan addresses five key changes to streamline the authentication and navigation flow:

1. **Remove candidate signup** - Candidates can only create accounts by purchasing a bundle
2. **Magic link authentication only** - Remove password-based login, use magic links
3. **Consolidate dashboard routes** - Single `/dashboard` route that renders based on user role
4. **Update /employer landing CTAs** - "Send Test" → signup, "Try Test" → practice
5. **Remove /auth/candidate route** - Candidates shouldn't be able to access signup

---

### What You'll Get

**For Candidates:**
- Sign in only via magic link (email-only, no password)
- No signup option - accounts created only through bundle purchase
- Practice tests still work without any account

**For Employers:**
- Sign up/sign in via magic link
- Single `/dashboard` that auto-displays employer content

**Landing Page (/employer):**
- "Send Test" button → takes to employer signup
- "Try Test" button → launches practice test directly

---

### Technical Implementation

#### 1. Update AuthForm Component
**File:** `src/components/auth/AuthForm.tsx`

- Remove password fields from login form
- Add magic link sign-in method using `supabase.auth.signInWithOtp()`
- For employers: keep signup tab with magic link (no password)
- For candidates: remove signup tab entirely, show sign-in only
- Update UI to explain "We'll send you a magic link"

#### 2. Update useAuth Hook
**File:** `src/hooks/useAuth.tsx`

- Add `signInWithMagicLink(email)` method
- Update `signUp` to use magic link flow (no password)
- Remove password from sign-in flow

#### 3. Update Auth Page
**File:** `src/pages/Auth.tsx`

- For `/auth/candidate`: show sign-in only (no signup tab, no toggle)
- For `/auth/employer`: show both sign-in and sign-up tabs
- Remove the Business/Candidate toggle when accessing `/auth/candidate`

#### 4. Consolidate Dashboard Routes
**File:** `src/App.tsx`

Remove these redundant routes:
```text
/dashboard/employer  → REMOVE
/dashboard/candidate → REMOVE
```

Keep only:
```text
/dashboard → renders EmployerDashboard or CandidateDashboard based on profile.role
```

The existing `Dashboard.tsx` already handles this logic correctly.

#### 5. Update Index.tsx (Employer Landing)
**File:** `src/pages/Index.tsx`

Update hero CTAs:
- First button: "Send Test" → `/auth/employer`
- Second button: "Try Test" → `/practice/start`

Update bottom CTA section similarly.

#### 6. Update Practice.tsx (Paid Bundles)
**File:** `src/pages/Practice.tsx`

For paid bundles (Starter Pack, Pro Bundle):
- Link to a future `/purchase` page or show a payment flow
- Do NOT link to `/auth/candidate` since candidates can't sign up directly

#### 7. Update AuthForm Navigation
**File:** `src/components/auth/AuthForm.tsx`

After successful login, redirect to `/dashboard` (not `/dashboard/employer` or `/dashboard/candidate`).

---

### File Changes Summary

| File | Changes |
|------|---------|
| `src/hooks/useAuth.tsx` | Add `signInWithMagicLink`, remove password from flows |
| `src/components/auth/AuthForm.tsx` | Magic link UI, remove password fields, conditional signup for employers only |
| `src/pages/Auth.tsx` | Remove toggle for candidates, hide signup tab for candidates |
| `src/pages/Index.tsx` | Update CTAs: "Send Test" and "Try Test" |
| `src/pages/Practice.tsx` | Update paid bundle links (not to /auth/candidate) |
| `src/App.tsx` | Remove `/dashboard/employer` and `/dashboard/candidate` routes |

---

### Flow Diagrams

**Employer Flow:**
```text
/employer → "Send Test" → /auth/employer → Sign Up (magic link) → /dashboard
```

**Candidate Sign In Flow:**
```text
/practice → "Sign In" → /auth/candidate → Sign In only (magic link) → /dashboard
```

**Practice Test Flow (unchanged):**
```text
/employer or /practice → "Try Test" → /practice/start → Test Session (no account needed)
```

**Bundle Purchase Flow (future):**
```text
/practice → Select Paid Bundle → Payment → Account Created → /dashboard
```

