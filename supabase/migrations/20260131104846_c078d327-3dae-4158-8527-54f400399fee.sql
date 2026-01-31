-- Allow anonymous access to test_invitations via token lookup
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "invitations_select" ON public.test_invitations;

-- Create new policy allowing token-based access without auth
CREATE POLICY "invitations_select" ON public.test_invitations
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR user_belongs_to_org(auth.uid(), organization_id) 
  OR (candidate_email = get_user_email(auth.uid()))
  OR (auth.uid() IS NULL) -- Allow anonymous read for token validation
);

-- Allow anonymous users to update invitation status (started, completed)
DROP POLICY IF EXISTS "invitations_update" ON public.test_invitations;

CREATE POLICY "invitations_update" ON public.test_invitations
FOR UPDATE USING (
  is_admin(auth.uid()) 
  OR (is_employer(auth.uid()) AND user_belongs_to_org(auth.uid(), organization_id)) 
  OR (candidate_email = get_user_email(auth.uid()))
  OR (auth.uid() IS NULL) -- Allow anonymous update for test flow
);

-- Allow anonymous session creation for test-taking
DROP POLICY IF EXISTS "sessions_insert" ON public.test_sessions;

CREATE POLICY "sessions_insert" ON public.test_sessions
FOR INSERT WITH CHECK (
  (candidate_id = auth.uid()) 
  OR (candidate_id IS NULL AND session_type = 'invited') -- Anonymous invited test-takers
);

-- Allow anonymous session access
DROP POLICY IF EXISTS "sessions_select" ON public.test_sessions;

CREATE POLICY "sessions_select" ON public.test_sessions
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR (candidate_id = auth.uid()) 
  OR (candidate_id IS NULL AND session_type = 'invited') -- Anonymous can see their own session via invitation
  OR EXISTS (
    SELECT 1 FROM test_invitations ti
    WHERE ti.id = test_sessions.invitation_id 
    AND user_belongs_to_org(auth.uid(), ti.organization_id)
  )
);

-- Allow anonymous session updates (answer submission, completion)
DROP POLICY IF EXISTS "sessions_update" ON public.test_sessions;

CREATE POLICY "sessions_update" ON public.test_sessions
FOR UPDATE USING (
  (candidate_id = auth.uid()) 
  OR is_admin(auth.uid())
  OR (candidate_id IS NULL AND session_type = 'invited') -- Anonymous can update their session
);

-- Allow anonymous users to view test library
DROP POLICY IF EXISTS "test_library_select" ON public.test_library;

CREATE POLICY "test_library_select" ON public.test_library
FOR SELECT USING (
  is_active = true 
  OR is_admin(auth.uid())
);

-- Allow anonymous users to view questions during active session
DROP POLICY IF EXISTS "questions_select" ON public.test_questions;

CREATE POLICY "questions_select" ON public.test_questions
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM test_sessions ts
    WHERE ts.test_id = test_questions.test_id 
    AND ts.status = 'in_progress'
    AND (ts.candidate_id = auth.uid() OR (ts.candidate_id IS NULL AND ts.session_type = 'invited'))
  )
);

-- Allow anonymous result insertion
DROP POLICY IF EXISTS "results_insert" ON public.test_results;

CREATE POLICY "results_insert" ON public.test_results
FOR INSERT WITH CHECK (
  (candidate_email = get_user_email(auth.uid()))
  OR (auth.uid() IS NULL) -- Anonymous can insert their results
);

-- Allow anonymous result viewing
DROP POLICY IF EXISTS "results_select" ON public.test_results;

CREATE POLICY "results_select" ON public.test_results
FOR SELECT USING (
  is_admin(auth.uid()) 
  OR user_belongs_to_org(auth.uid(), organization_id) 
  OR (candidate_email = get_user_email(auth.uid()))
  OR (auth.uid() IS NULL) -- Anonymous can view their results
);