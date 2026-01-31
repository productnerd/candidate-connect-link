-- Allow anonymous practice sessions to be created/updated/selected (needed for question access via RLS)

DROP POLICY IF EXISTS sessions_insert ON public.test_sessions;
CREATE POLICY sessions_insert
ON public.test_sessions
FOR INSERT
WITH CHECK (
  is_admin(auth.uid())
  OR (candidate_id = auth.uid())
  OR (candidate_id IS NULL AND session_type IN ('invited', 'practice'))
);

DROP POLICY IF EXISTS sessions_select ON public.test_sessions;
CREATE POLICY sessions_select
ON public.test_sessions
FOR SELECT
USING (
  is_admin(auth.uid())
  OR (candidate_id = auth.uid())
  OR (candidate_id IS NULL AND session_type IN ('invited', 'practice'))
  OR EXISTS (
    SELECT 1
    FROM test_invitations ti
    WHERE ti.id = test_sessions.invitation_id
      AND user_belongs_to_org(auth.uid(), ti.organization_id)
  )
);

DROP POLICY IF EXISTS sessions_update ON public.test_sessions;
CREATE POLICY sessions_update
ON public.test_sessions
FOR UPDATE
USING (
  is_admin(auth.uid())
  OR (candidate_id = auth.uid())
  OR (candidate_id IS NULL AND session_type IN ('invited', 'practice'))
);
