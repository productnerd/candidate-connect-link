# CCAT Platform — Architecture Reference

> Generated 2026-02-18. Use this document to onboard into the codebase with any AI coding tool.

---

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Edge Functions + Storage)
- **Payments:** Stripe (one-time checkout sessions)
- **Email:** Resend

---

## Database Schema

### `profiles`
User profiles, created automatically via a trigger on `auth.users`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid (PK) | No | — | Matches `auth.users.id` |
| email | varchar | No | — | |
| full_name | varchar | Yes | — | |
| role | enum `user_role` | No | `'candidate'` | `employer` / `candidate` / `admin` |
| organization_id | uuid (FK → organizations) | Yes | — | |
| avatar_url | text | Yes | — | |
| created_at | timestamptz | Yes | `now()` | |
| updated_at | timestamptz | Yes | `now()` | |

**RLS:** Users see own profile + admins see all + employers see same-org profiles. Users can only insert/update their own.

---

### `user_roles`
Supports multi-role users (e.g. someone who is both employer and candidate).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| role | enum `user_role` | No | — |
| created_at | timestamptz | Yes | `now()` |

**Unique constraint:** `(user_id, role)`. **RLS:** Users see/insert own roles only.

---

### `organizations`
Employer companies. Candidates may also get a personal org upon purchasing a bundle.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| name | varchar | No | — |
| slug | varchar | No | — |
| industry | varchar | Yes | — |
| size_category | enum `organization_size` | Yes | `'startup'` |
| created_at | timestamptz | Yes | `now()` |
| updated_at | timestamptz | Yes | `now()` |

**Enums:** `organization_size` = `startup` / `smb` / `midmarket` / `enterprise`

**RLS:** Admins + same-org users can SELECT. Admins + same-org employers can UPDATE. Any authenticated user can INSERT. No DELETE.

---

### `test_library`
Catalog of available tests.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| name | varchar | No | — |
| slug | varchar | No | — |
| description | text | Yes | — |
| category | enum `test_category` | No | `'cognitive'` |
| subcategory | varchar | Yes | — |
| difficulty_level | varchar | Yes | `'medium'` |
| duration_minutes | integer | No | `30` |
| question_count | integer | No | `20` |
| recommended_for | jsonb | Yes | `'[]'` |
| is_active | boolean | Yes | `true` |
| requires_proctoring | boolean | Yes | `true` |
| created_at | timestamptz | Yes | `now()` |
| updated_at | timestamptz | Yes | `now()` |

**Enums:** `test_category` = `cognitive` / `personality` / `skills` / `situational`

**RLS:** Anyone can SELECT active tests. Admins can SELECT all. No INSERT/UPDATE/DELETE for non-admins.

---

### `test_questions`
Question bank. Questions are reused across tests via `test_question_links`.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| question_text | text | No | — |
| question_type | enum `question_type` | No | `'multiple_choice'` |
| category | enum `question_category` | No | `'math_logic'` |
| correct_answer | text | No | — |
| explanation | text | Yes | — |
| options | jsonb | Yes | `'[]'` |
| difficulty | varchar | Yes | `'medium'` |
| pool | enum `question_pool` | Yes | `'basic'` |
| order_number | integer | No | — |
| points | integer | Yes | `1` |
| image_url | text | Yes | — |
| time_limit_seconds | integer | Yes | — |
| created_at | timestamptz | Yes | `now()` |

**Enums:**
- `question_type` = `multiple_choice` / `true_false` / `short_answer`
- `question_category` = `math_logic` / `verbal_reasoning` / `spatial_reasoning`
- `question_pool` = `basic` / `premium` / `official`

**RLS:** Only visible to admins OR to users with an active in-progress session linked to a test that includes the question.

---

### `test_question_links`
Junction table linking questions to tests (many-to-many). Standard structure: 18 math, 18 verbal, 14 spatial = 50 questions per test.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| test_id | uuid (FK → test_library) | No | — |
| question_id | uuid (FK → test_questions) | No | — |
| order_number | integer | No | — |
| created_at | timestamptz | Yes | `now()` |

**RLS:** SELECT allowed if test is active OR user is admin. Only admins can INSERT/UPDATE/DELETE.

---

### `test_invitations`
Tracks employer-sent test invitations to candidates.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| organization_id | uuid (FK → organizations) | Yes | — |
| test_id | uuid (FK → test_library) | No | — |
| invited_by | uuid | Yes | — |
| candidate_email | varchar | No | — |
| candidate_name | varchar | Yes | — |
| inviter_name | varchar | Yes | — |
| inviter_email | varchar | Yes | — |
| company_name | varchar | Yes | — |
| company_logo_url | text | Yes | — |
| invitation_token | varchar | No | — |
| test_type | varchar | Yes | `'basic'` |
| status | enum `invitation_status` | Yes | `'pending'` |
| expires_at | timestamptz | No | — |
| started_at | timestamptz | Yes | — |
| completed_at | timestamptz | Yes | — |
| created_at | timestamptz | Yes | `now()` |

**Enums:** `invitation_status` = `pending` / `started` / `completed` / `expired`

**RLS:** Complex policies supporting both authenticated employers and anonymous basic invitations (where `organization_id IS NULL` and `test_type = 'basic'`).

---

### `test_sessions`
Active or completed test-taking sessions.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| test_id | uuid (FK → test_library) | No | — |
| invitation_id | uuid (FK → test_invitations) | Yes | — |
| candidate_id | uuid | Yes | — |
| session_type | varchar | No | `'real'` |
| status | enum `session_status` | Yes | `'in_progress'` |
| current_question_index | integer | Yes | `0` |
| answers | jsonb | Yes | `'[]'` |
| start_time | timestamptz | Yes | `now()` |
| end_time | timestamptz | Yes | — |
| time_remaining_seconds | integer | Yes | — |
| proctoring_enabled | boolean | Yes | `true` |
| proctoring_consent_given | boolean | Yes | `false` |
| ip_address | varchar | Yes | — |
| user_agent | text | Yes | — |
| created_at | timestamptz | Yes | `now()` |

**Session types:** `real` (authenticated), `invited` (anonymous via invitation), `practice` (anonymous practice)

**Enums:** `session_status` = `in_progress` / `completed` / `abandoned`

**RLS:** Supports anonymous sessions for `invited` and `practice` types (where `candidate_id IS NULL`).

---

### `test_results`
Final scored results for employer-invited tests.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| session_id | uuid (FK → test_sessions) | No | — |
| test_id | uuid (FK → test_library) | No | — |
| invitation_id | uuid (FK → test_invitations) | Yes | — |
| organization_id | uuid (FK → organizations) | Yes | — |
| candidate_email | varchar | No | — |
| score | integer | No | — |
| time_taken_seconds | integer | Yes | — |
| category_scores | jsonb | Yes | `'{}'` |
| question_breakdown | jsonb | Yes | `'[]'` |
| completed_at | timestamptz | Yes | `now()` |
| created_at | timestamptz | Yes | `now()` |

**RLS:** Admins + same-org users + the candidate themselves can SELECT. Only admins or the candidate can INSERT.

**Percentile calculation:** Computed dynamically on page load by comparing `score` against all `test_results` rows for the same `test_id`. Not stored.

---

### `candidate_test_history`
Persists practice/mock/learning test results for authenticated candidates.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid (FK → profiles) | No | — |
| session_id | uuid | Yes | — |
| test_type | text | No | — |
| score | integer | No | — |
| total_questions | integer | No | — |
| time_taken_seconds | integer | Yes | — |
| category_scores | jsonb | Yes | `'{}'` |
| completed_at | timestamptz | Yes | `now()` |
| created_at | timestamptz | Yes | `now()` |

**RLS:** Users see/insert/update only their own records. Admins can see all.

---

### `test_bundles`
Tracks purchased test packages (Stripe payments).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | `gen_random_uuid()` |
| organization_id | uuid (FK → organizations) | No | — |
| bundle_type | enum `bundle_type` | No | — |
| tests_purchased | integer | No | — |
| tests_remaining | integer | No | — |
| amount_paid | integer | No | `0` |
| stripe_payment_id | varchar | Yes | — |
| purchased_at | timestamptz | Yes | `now()` |
| expires_at | timestamptz | Yes | — |
| created_at | timestamptz | Yes | `now()` |

**Enums:** `bundle_type` = `starter` / `professional` / `enterprise`

---

## Database Functions (RPCs)

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Trigger on `auth.users` INSERT → creates `profiles` + `user_roles` rows |
| `has_role(user_id, role)` | Check if user has a specific role |
| `is_admin(user_id)` | Shortcut for `has_role(user_id, 'admin')` |
| `is_employer(user_id)` | Shortcut for `has_role(user_id, 'employer')` |
| `is_candidate(user_id)` | Shortcut for `has_role(user_id, 'candidate')` |
| `get_user_email(user_id)` | Get email from profiles table |
| `get_user_org_id(user_id)` | Get organization_id from profiles table |
| `user_belongs_to_org(user_id, org_id)` | Check org membership |
| `check_sender_daily_limit(email)` | Rate limit: max 3 invitations per sender per day |
| `check_sender_total_limit(email)` | Rate limit: max 10 total free invitations per sender |
| `check_domain_invite_limit(email)` | Rate limit: max 10 free invitations per company domain (excludes public email providers) |
| `check_candidate_cooldown(sender, recipient)` | Rate limit: 30-day cooldown between repeat invitations |
| `get_domain_invite_count(email)` | Returns current domain invite count |
| `update_updated_at_column()` | Generic trigger to set `updated_at = now()` on UPDATE |

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `company-logos` | Yes | Employer company logos uploaded during invitation flow |
| `question-assets` | Yes | Images referenced by `test_questions.image_url` |
| `results-media` | Yes | Background images/videos for the results page |

---

## Edge Functions

### `validate-invitation`
**Auth:** No JWT required (public endpoint)
**Purpose:** Validates an invitation token for anonymous test-takers. Returns invitation details + test metadata without exposing sensitive data. Checks expiration and completion status.
**Input:** `{ token: string }`
**Output:** `{ invitation: {...}, test: {...} }`

### `start-invited-test`
**Auth:** No JWT required (public endpoint)
**Purpose:** Creates a `test_session` for an invited candidate and updates the invitation status to `started`. Validates the token, checks expiration, and prevents re-takes.
**Input:** `{ token: string, invitationId: string, testId: string }`
**Output:** `{ sessionId: string }`

### `send-test-invitation`
**Auth:** JWT required (authenticated employers only)
**Purpose:** Sends invitation email to a candidate via Resend. Also auto-creates a Supabase Auth account for the candidate (with random password, email pre-confirmed) so they have a profile ready.
**Input:** `{ candidateEmail, candidateName, testName, inviterName, companyName, invitationToken, expiresAt, baseUrl }`

### `send-basic-test-invitation`
**Auth:** No JWT required (public endpoint for free-tier employers)
**Purpose:** Same as `send-test-invitation` but for unauthenticated/free-tier employers. Enforces rate limits via RPCs (daily limit, total limit, domain limit, candidate cooldown). Also auto-creates both employer AND candidate Supabase Auth accounts, plus creates an organization for the employer.
**Input:** Same as above, plus `inviterEmail`

### `create-checkout`
**Auth:** Optional JWT (supports guest checkout)
**Purpose:** Creates a Stripe Checkout Session for bundle purchases. Maps bundle types to Stripe price IDs. Redirects employer purchases to `/payment-success` and candidate purchases to `/dashboard?payment=success`.
**Input:** `{ bundle_type: string }` — one of `candidate_unlimited`, `employer_30`, `employer_100`, `employer_500`
**Output:** `{ url: string }` — Stripe checkout URL

### `verify-payment`
**Auth:** No JWT required
**Purpose:** Verifies a completed Stripe checkout session. For `candidate_unlimited` bundles, creates a `test_bundles` record and (if needed) a personal organization for the candidate.
**Input:** `{ session_id: string }`
**Output:** `{ success: true, email, bundle_type, payment_status }`

### `send-payment-confirmation`
**Auth:** No JWT required
**Purpose:** Sends a post-purchase confirmation email via Resend with a link to complete account setup.
**Input:** `{ email: string, bundle_type: string, signup_url: string }`

---

## Secrets (Environment Variables for Edge Functions)

| Secret | Used By |
|--------|---------|
| `SUPABASE_URL` | All edge functions |
| `SUPABASE_ANON_KEY` | Edge functions needing user-context queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions bypassing RLS |
| `STRIPE_SECRET_KEY` | `create-checkout`, `verify-payment` |
| `RESEND_API_KEY` | `send-test-invitation`, `send-basic-test-invitation`, `send-payment-confirmation` |
| `LOVABLE_API_KEY` | AI gateway (unused currently) |

---

## Frontend Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

---

## Key Architectural Patterns

1. **Decoupled question bank:** Questions exist independently in `test_questions` and are linked to tests via `test_question_links`. This supports reuse across multiple tests.

2. **Anonymous test-taking:** Invited candidates take tests without authenticating. Edge functions (`validate-invitation`, `start-invited-test`) use the service role to bypass RLS. Sessions have `candidate_id = NULL` and `session_type = 'invited'`.

3. **Silent account creation:** When an invitation is sent, Supabase Auth accounts are automatically created for both the candidate and (for basic invitations) the employer, with random passwords and pre-confirmed emails.

4. **Dual result storage:** Employer-invited test results go to `test_results`. Candidate practice/mock/learning results go to `candidate_test_history`. Percentile rankings compare against `test_results`.

5. **Practice sessions:** Stored client-side in `sessionStorage` (via `practiceSessionStorage.ts`). Pending scores for unauthenticated users are saved to `localStorage` (via `pendingScoreStorage.ts`) and migrated to `candidate_test_history` after signup.

6. **Rate limiting:** Free-tier invitation sending is rate-limited via database RPCs (daily, total, domain, and per-candidate cooldown limits).

7. **Multi-role support:** Users can have multiple roles (employer + candidate) tracked in `user_roles`. A `RoleToggle` component in the dashboard header lets users switch views.
