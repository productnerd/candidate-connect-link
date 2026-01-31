

# Candidate Dashboard Enhancement Plan

## Overview
This plan transforms the Candidate Dashboard from a simple test history view into a comprehensive practice hub for users who have purchased the Unlimited Bundle. The dashboard will feature score analytics, mock tests, and a new "Learning Mode" for practicing without time pressure.

---

## Current State
- Dashboard shows pending employer test invitations and test history
- Practice tests use local sessionStorage for state
- Results are not persisted to the database for anonymous users
- 9 premium-pool questions exist in the database
- Some questions already have explanations, but many are missing

---

## Feature Summary

### 1. Score Analytics Section
A prominent chart showing test performance over time, with category breakdowns.

### 2. Mock Test Mode
Timed tests using premium questions, identical UX to free tests but pulling from the premium pool.

### 3. Learning Test Mode
Untimed practice with immediate feedback and explanations after each answer.

### 4. Pro Tip Toast
When submitting a mock test with more than one unanswered question, display a toast recommending random answers over blanks.

---

## Database Changes

### Schema Migration

1. **Add `explanation` field verification**
   - The `test_questions` table already has an `explanation` column
   - Populate missing explanations with sample text for existing questions

2. **Create `candidate_test_history` table**
   Store practice test results for authenticated users (separate from employer-visible `test_results`):
   
   ```text
   candidate_test_history
   +------------------+-------------------+
   | Column           | Type              |
   +------------------+-------------------+
   | id               | uuid (PK)         |
   | user_id          | uuid (FK profiles)|
   | session_id       | uuid              |
   | test_type        | text              | -- 'mock' | 'learning' | 'free'
   | score            | integer           |
   | total_questions  | integer           |
   | time_taken_seconds| integer          |
   | category_scores  | jsonb             |
   | completed_at     | timestamptz       |
   | created_at       | timestamptz       |
   +------------------+-------------------+
   ```

3. **RLS Policies for `candidate_test_history`**
   - Users can only see/insert their own records
   - Admins can see all

---

## New Pages and Components

### 1. Enhanced CandidateDashboard.tsx

```text
+-----------------------------------------------+
|  Navbar                                       |
+-----------------------------------------------+
|  Welcome back, [Name]!                        |
|                                               |
|  [Pending Tests Section - kept small]         |
|  (if any exist)                               |
+-----------------------------------------------+
|  YOUR PROGRESS                                |
|  +-------------------------------------------+|
|  |        Score Over Time Chart              ||
|  |  (line chart showing % scores by date)   ||
|  +-------------------------------------------+|
|                                               |
|  Category Breakdown                           |
|  [Math/Logic: 75%] [Verbal: 68%] [Spatial: 82%]|
+-----------------------------------------------+
|  START PRACTICING                             |
|  +-------------------+  +-------------------+ |
|  |   Mock Test       |  |   Learning Mode   | |
|  |   5 questions     |  |   No timer        | |
|  |   [Start Mock]    |  |   [Start Learn]   | |
|  +-------------------+  +-------------------+ |
+-----------------------------------------------+
|  RECENT TESTS                                 |
|  (list of recent practice sessions)           |
+-----------------------------------------------+
```

### 2. New Learning Test Session Page
Create `src/pages/LearningSession.tsx`:
- Similar structure to PracticeSession but:
  - No timer displayed (no time pressure)
  - After selecting an answer, immediately show:
    - Whether it was correct/incorrect
    - The explanation for the correct answer
  - "Next Question" button instead of auto-advance
  - Results page shows score without time taken

### 3. Modified PracticeSession.tsx
- Add logic to detect incomplete questions on submit
- Show toast when more than 1 question is unanswered:
  "PRO TIP: Better pick a random answer instead of leaving questions unanswered."

### 4. Mock Test Start Flow
Create route `/candidate/mock` that:
- Fetches 5 random questions from `pool = 'premium'`
- Creates a dynamic test session (not linked to test_library)
- Uses the same PracticeSession component

---

## Route Changes

| Route | Page | Purpose |
|-------|------|---------|
| `/candidate/mock` | StartMockTest.tsx | Initialize mock test with random premium questions |
| `/candidate/learn` | StartLearningTest.tsx | Initialize learning mode session |
| `/candidate/learn/session/:id` | LearningSession.tsx | Learning mode question interface |
| `/candidate/learn/results/:id` | LearningResults.tsx | Learning mode results (no time shown) |

---

## Implementation Sequence

### Phase 1: Database Setup
1. Create migration for `candidate_test_history` table with RLS
2. Update existing `test_questions` with mock explanations where missing

### Phase 2: Dashboard Redesign
1. Refactor CandidateDashboard.tsx layout
2. Add score history chart using Recharts (already installed)
3. Add "Start Mock Test" and "Start Learning Mode" cards
4. Keep pending tests section but make it smaller/collapsible

### Phase 3: Mock Test Feature
1. Create StartMockTest.tsx to fetch random premium questions
2. Store temporary question set in sessionStorage
3. Update PracticeSession to handle dynamic question sets
4. Add "Pro Tip" toast on submission with incomplete questions
5. Save results to `candidate_test_history` on completion

### Phase 4: Learning Mode
1. Create LearningSession.tsx with:
   - No timer UI
   - Answer reveal after selection
   - Explanation display component
   - Next button instead of auto-advance
2. Create LearningResults.tsx (similar to PracticeResults but no time stats)
3. Create StartLearningTest.tsx

### Phase 5: History Integration
1. Query `candidate_test_history` for chart data
2. Attempt to match anonymous free test scores by checking if user email matches any `test_results` records (fallback)
3. Display recent tests in dashboard

---

## Technical Details

### Chart Component
Using existing Recharts dependency:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Data format:
const chartData = [
  { date: '1/15', score: 65 },
  { date: '1/20', score: 72 },
  { date: '1/25', score: 78 },
];
```

### Random Question Selection
```typescript
const { data } = await supabase
  .from('test_questions')
  .select('*')
  .eq('pool', 'premium')
  .limit(20); // Fetch more than needed

// Shuffle and take 5
const shuffled = data.sort(() => Math.random() - 0.5);
const selected = shuffled.slice(0, 5);
```

### Pro Tip Toast Logic
```typescript
// In handleSubmit of PracticeSession
const unanswered = questions.length - answers.filter(a => a.answer).length;
if (unanswered > 1) {
  toast({
    title: "PRO TIP",
    description: "Better pick a random answer instead of leaving questions unanswered.",
    duration: 5000,
  });
}
```

### Learning Mode Answer Reveal
```typescript
const [revealedAnswer, setRevealedAnswer] = useState(false);

const handleAnswer = (answer: string) => {
  // Save answer
  setRevealedAnswer(true);
  // Show correct/incorrect + explanation
};
```

---

## Sample Explanations to Add
For questions without explanations, add educational mock text:

| Question Type | Sample Explanation |
|---------------|-------------------|
| Math/Speed calculation | "Distance divided by time gives average speed. Here: 240 / 4 = 60 mph." |
| Ratio problems | "In a 3:5 ratio with 24 total, divide 24 by 8 parts, then multiply by each ratio." |
| Verbal analogies | "Architect creates blueprints for buildings; composers create scores for music." |
| Pattern recognition | "Look for multiplication, addition patterns, or common sequences like squares." |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/xxx.sql` | Create | candidate_test_history table + RLS |
| `src/pages/CandidateDashboard.tsx` | Modify | Complete redesign with chart + action cards |
| `src/pages/StartMockTest.tsx` | Create | Mock test initialization |
| `src/pages/LearningSession.tsx` | Create | Learning mode test interface |
| `src/pages/LearningResults.tsx` | Create | Learning mode results display |
| `src/pages/StartLearningTest.tsx` | Create | Learning mode initialization |
| `src/pages/PracticeSession.tsx` | Modify | Add pro tip toast logic |
| `src/App.tsx` | Modify | Add new routes |
| `src/lib/practiceSessionStorage.ts` | Modify | Add learning mode session type |

---

## Access Control
The dashboard remains accessible only to authenticated users with the candidate role. Bundle verification is handled by checking for `candidate_unlimited` bundle ownership before allowing mock/learning tests (or simply trust that only bundle owners reach this page per existing routing).

