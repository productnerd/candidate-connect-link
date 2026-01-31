
-- Drop existing policy
DROP POLICY IF EXISTS "questions_select" ON public.test_questions;

-- Create updated policy that includes practice sessions
CREATE POLICY "questions_select" ON public.test_questions
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR (EXISTS (
    SELECT 1
    FROM test_question_links tql
    JOIN test_sessions ts ON ts.test_id = tql.test_id
    WHERE tql.question_id = test_questions.id 
      AND ts.status = 'in_progress'::session_status
      AND (
        ts.candidate_id = auth.uid() 
        OR (ts.candidate_id IS NULL AND ts.session_type IN ('invited', 'practice'))
      )
  ))
);
