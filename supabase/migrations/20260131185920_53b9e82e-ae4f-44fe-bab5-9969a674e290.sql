
-- Step 1: Create new enums
CREATE TYPE public.question_pool AS ENUM ('basic', 'premium', 'official');
CREATE TYPE public.question_category AS ENUM ('math_logic', 'verbal_reasoning', 'spatial_reasoning');

-- Step 2: Add new columns to test_questions
ALTER TABLE public.test_questions 
ADD COLUMN pool public.question_pool DEFAULT 'basic',
ADD COLUMN category public.question_category DEFAULT 'math_logic',
ADD COLUMN image_url text;

-- Step 3: Make category NOT NULL after setting defaults
ALTER TABLE public.test_questions ALTER COLUMN category SET NOT NULL;

-- Step 4: Create junction table for test-question relationships
CREATE TABLE public.test_question_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid NOT NULL REFERENCES public.test_library(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  order_number integer NOT NULL CHECK (order_number >= 1 AND order_number <= 50),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(test_id, question_id)
);

-- Step 5: Migrate existing test_id relationships to junction table
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT test_id, id, order_number
FROM public.test_questions
WHERE test_id IS NOT NULL;

-- Step 6: Drop the RLS policy that depends on test_id BEFORE dropping column
DROP POLICY IF EXISTS "questions_select" ON public.test_questions;

-- Step 7: Drop the old test_id foreign key and column from test_questions
ALTER TABLE public.test_questions DROP CONSTRAINT IF EXISTS test_questions_test_id_fkey;
ALTER TABLE public.test_questions DROP COLUMN test_id;

-- Step 8: Remove percentage and percentile columns from test_results
ALTER TABLE public.test_results DROP COLUMN percentage;
ALTER TABLE public.test_results DROP COLUMN percentile;

-- Step 9: Enable RLS on junction table
ALTER TABLE public.test_question_links ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for test_question_links
CREATE POLICY "links_select" ON public.test_question_links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.test_library tl
    WHERE tl.id = test_id AND tl.is_active = true
  ) OR is_admin(auth.uid())
);

CREATE POLICY "links_insert" ON public.test_question_links
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "links_update" ON public.test_question_links
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "links_delete" ON public.test_question_links
FOR DELETE USING (is_admin(auth.uid()));

-- Step 11: Create new RLS policy for test_questions using junction table
CREATE POLICY "questions_select" ON public.test_questions
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.test_question_links tql
    JOIN public.test_sessions ts ON ts.test_id = tql.test_id
    WHERE tql.question_id = test_questions.id
    AND ts.status = 'in_progress'
    AND (ts.candidate_id = auth.uid() OR (ts.candidate_id IS NULL AND ts.session_type = 'invited'))
  )
);

-- Step 12: Create indexes for better query performance
CREATE INDEX idx_test_question_links_test_id ON public.test_question_links(test_id);
CREATE INDEX idx_test_question_links_question_id ON public.test_question_links(question_id);
