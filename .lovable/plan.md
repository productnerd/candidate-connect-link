
# Plan: Persist Anonymous Practice Scores to New Candidate Accounts

## Overview
Enable anonymous users who take free practice tests to have their best score automatically saved to their account when they sign up after purchasing the Unlimited Bundle.

## Solution Architecture

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Practice Test   │────▶│ Store in         │────▶│ Checkout + Signup   │
│ Completion      │     │ localStorage     │     │ (PaymentSuccess)    │
└─────────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                            │
                        ┌──────────────────┐                ▼
                        │ AuthCallback     │◀───── Magic Link Verified
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Check localStorage│
                        │ for pending score │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Insert into      │
                        │ candidate_test_  │
                        │ history table    │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Clear localStorage│
                        │ Redirect to      │
                        │ Dashboard        │
                        └──────────────────┘
```

## Why localStorage Over URL Parameters?

| Approach | Pros | Cons |
|----------|------|------|
| **URL Parameters** | Simple to implement | Data lost if user closes tab; URL becomes long/ugly; security concerns with exposing scores |
| **localStorage** | Persists across tabs/sessions; survives page refreshes; cleaner URLs | Requires cleanup logic |
| **Database staging table** | Most robust | Requires additional table, RLS policies, and cleanup jobs |

**Recommendation**: localStorage is the best balance of robustness and simplicity for this use case.

## Implementation Steps

### Step 1: Create Pending Score Storage Utility
Create a new utility file to manage pending practice scores in localStorage.

**New file**: `src/lib/pendingScoreStorage.ts`
- `savePendingScore(score)` - Store best practice test result
- `loadPendingScore()` - Retrieve pending score if exists
- `clearPendingScore()` - Remove after successful migration
- Store: score, total_questions, time_taken_seconds, category_scores, test_type, completed_at

### Step 2: Save Score on Practice Test Completion
Modify `PracticeResults.tsx` to save the score to localStorage when an anonymous user completes a test.

**Modified file**: `src/pages/PracticeResults.tsx`
- After test completion, if user is not authenticated, call `savePendingScore()`
- Only keep the latest/best score (compare and update if new score is higher)

### Step 3: Migrate Score After Account Verification
Modify `AuthCallback.tsx` to check for pending scores and insert them into the database.

**Modified file**: `src/pages/AuthCallback.tsx`
- After successful auth and profile creation, check `loadPendingScore()`
- If exists, insert into `candidate_test_history` table with new `user_id`
- Call `clearPendingScore()` after successful insert
- Then redirect to dashboard

### Step 4: Handle Edge Cases
- If user already has scores in dashboard, don't duplicate
- If localStorage has multiple test attempts, only migrate the best one
- Clean up sessionStorage practice sessions after migration

## Technical Details

### Pending Score Data Structure
```typescript
interface PendingPracticeScore {
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  category_scores: Record<string, { correct: number; total: number }>;
  test_type: string;
  completed_at: string;
}
```

### localStorage Key
```typescript
const PENDING_SCORE_KEY = 'pending_practice_score';
```

### Migration Logic in AuthCallback
```typescript
// After profile is confirmed...
const pendingScore = loadPendingScore();
if (pendingScore) {
  await supabase.from('candidate_test_history').insert({
    user_id: session.user.id,
    score: pendingScore.score,
    total_questions: pendingScore.total_questions,
    time_taken_seconds: pendingScore.time_taken_seconds,
    category_scores: pendingScore.category_scores,
    test_type: pendingScore.test_type,
    completed_at: pendingScore.completed_at,
  });
  clearPendingScore();
}
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/pendingScoreStorage.ts` | Create | localStorage utility for pending scores |
| `src/pages/PracticeResults.tsx` | Modify | Save score to localStorage on completion |
| `src/pages/AuthCallback.tsx` | Modify | Migrate pending score to database |
| `src/pages/MockResults.tsx` | Modify | Also save mock test scores (if applicable) |
| `src/pages/LearningResults.tsx` | Modify | Also save learning mode scores (if applicable) |

## Edge Cases Handled

1. **User takes 2 free tests**: Only the latest (or best) score is stored
2. **User abandons signup**: Score persists in localStorage for future signup attempts
3. **User already has an account**: Skip migration if `candidate_test_history` already has records
4. **Browser cleared**: Score is lost, but this is acceptable given the free test nature
5. **Category scores available**: Full category breakdown is preserved for the dashboard charts

## Security Considerations

- Scores are only in the user's browser until they create an account
- No sensitive data is exposed in URLs
- Database insert uses authenticated session with proper RLS
- localStorage is cleared after successful migration

