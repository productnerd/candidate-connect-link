

# Database Schema Redesign for Question Bank & Test System

## Overview

This plan restructures the database to support a unified question bank with pool tagging, separated tests, proper scoring (raw score without percentages), and dynamic percentile calculation.

## Current State Analysis

**Existing Structure:**
- `test_library`: Contains test definitions (CCAT, Verbal Reasoning, etc.)
- `test_questions`: Questions directly linked to tests via `test_id`
- `test_results`: Stores `score`, `percentage`, and `percentile`
- `test_sessions`: Tracks test-taking progress

**Issues with Current Design:**
- Questions are tightly coupled to tests (can't be reused)
- No question pool tagging (basic/premium/official)
- No question category tagging (Math & Logic, Verbal Reasoning, Spatial Reasoning)
- Percentage is stored but you want raw score only
- No support for max 50 questions per test via junction table

---

## Proposed Database Changes

### 1. Create New Enum: `question_pool`

```text
Values: basic, premium, official
```

- **basic**: Free practice tests for candidates
- **premium**: Paid tests for candidates with unlimited bundle
- **official**: Questions used in employer-sent assessments

### 2. Create New Enum: `question_category`

```text
Values: math_logic, verbal_reasoning, spatial_reasoning
```

This replaces the current `question_type` which is about format (multiple_choice, true_false).

### 3. Modify `test_questions` Table

**Add columns:**
- `pool` (question_pool enum, default 'basic')
- `category` (question_category enum, NOT NULL)
- `image_url` (text, nullable) - optional image under question text

**Remove column:**
- `test_id` (foreign key) - will use junction table instead

**Modify column:**
- `options` constraint: ensure 2-6 options

### 4. Create Junction Table: `test_question_links`

```text
id             uuid PRIMARY KEY
test_id        uuid REFERENCES test_library(id)
question_id    uuid REFERENCES test_questions(id)
order_number   integer (1-50)
created_at     timestamp

UNIQUE(test_id, question_id)
CHECK: max 50 links per test
```

This allows:
- Questions to be reused across multiple tests
- Maximum of 50 questions per test
- Ordered question presentation

### 5. Modify `test_results` Table

**Remove column:**
- `percentage` (will be calculated on-the-fly)

**Keep column:**
- `percentile` (but don't store it - calculate dynamically)
- Actually, remove `percentile` too since you want dynamic calculation

**Modify column:**
- `score` remains as raw score (number of correct answers)

### 6. Add Category Breakdown to Results

The `category_scores` JSONB column already exists. We'll use it to store:
```json
{
  "math_logic": { "correct": 15, "total": 18 },
  "verbal_reasoning": { "correct": 14, "total": 18 },
  "spatial_reasoning": { "correct": 12, "total": 14 }
}
```

---

## Data Flow

```text
+------------------+          +---------------------+
|  test_questions  |          |    test_library     |
|------------------|          |---------------------|
| id               |          | id                  |
| question_text    |          | name                |
| options (2-6)    |<-------->| slug                |
| correct_answer   |   via    | duration_minutes    |
| category         |  links   | question_count (50) |
| pool             |          | ...                 |
| image_url        |          +---------------------+
+------------------+                   |
         ^                             |
         |                             v
         |                  +---------------------+
         |                  | test_question_links |
         +------------------+---------------------|
                            | test_id             |
                            | question_id         |
                            | order_number        |
                            +---------------------+
```

---

## Technical Details

### Migration Steps

1. **Create new enums:**
   - `question_pool`: 'basic', 'premium', 'official'
   - `question_category`: 'math_logic', 'verbal_reasoning', 'spatial_reasoning'

2. **Add columns to test_questions:**
   - `pool question_pool DEFAULT 'basic'`
   - `category question_category NOT NULL` (will set default for migration)
   - `image_url text`

3. **Create test_question_links junction table**

4. **Migrate existing data:**
   - Copy existing `test_id` relationships to `test_question_links`
   - Set category based on existing questions (infer from content or set default)

5. **Drop test_id column from test_questions** (after migration)

6. **Update test_results:**
   - Remove `percentage` column (calculate as `score / total * 100` in UI)
   - Remove `percentile` column (calculate dynamically by comparing scores)

7. **Update RLS policies for new junction table**

### Percentile Calculation (UI-side)

```typescript
// Query to calculate percentile dynamically
const calculatePercentile = async (testId: string, userScore: number) => {
  const { count: totalResults } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);
    
  const { count: belowScore } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId)
    .lt('score', userScore);
    
  return Math.round((belowScore / totalResults) * 100);
};
```

### Question Distribution per Test (50 questions)
- Math & Logic: 18 questions
- Verbal Reasoning: 18 questions
- Spatial Reasoning: 14 questions
- **Total: 50 questions**

---

## Frontend Updates Required

After the database changes, these files will need updates:

1. **PracticeSession.tsx** / **TestSession.tsx**
   - Query questions via junction table
   - Remove percentage from result submission

2. **PracticeResults.tsx** / **TestResults.tsx**
   - Calculate percentage on-the-fly: `(score / totalQuestions) * 100`
   - Add percentile calculation by querying other results
   - Display raw score prominently
   - Show category breakdown

3. **StartPracticeTest.tsx**
   - May need to handle question randomization from pool

---

## RLS Policies for New Table

```sql
-- test_question_links
-- SELECT: Anyone can view links for active tests
CREATE POLICY "links_select" ON test_question_links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM test_library tl
    WHERE tl.id = test_id AND tl.is_active = true
  ) OR is_admin(auth.uid())
);

-- INSERT/UPDATE/DELETE: Admin only
```

---

## Summary of Changes

| Table | Change Type | Details |
|-------|-------------|---------|
| test_questions | Modify | Add pool, category, image_url; Remove test_id |
| test_question_links | Create | Junction table for test-question relationships |
| test_results | Modify | Remove percentage and percentile columns |
| question_pool | Create | New enum for pool tagging |
| question_category | Create | New enum for category tagging |

