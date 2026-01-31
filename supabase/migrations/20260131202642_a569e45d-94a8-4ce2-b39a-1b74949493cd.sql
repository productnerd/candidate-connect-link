-- Fix RLS policies for test_invitations to remove anonymous access to all rows
-- Anonymous users should only be able to access their specific invitation via token lookup

-- Drop the vulnerable policies
DROP POLICY IF EXISTS "invitations_select" ON public.test_invitations;
DROP POLICY IF EXISTS "invitations_update" ON public.test_invitations;

-- Create secure SELECT policy (no anonymous full-table access)
-- Anonymous users must use a specific token-based lookup via edge function
CREATE POLICY "invitations_select" ON public.test_invitations
FOR SELECT
USING (
  is_admin(auth.uid()) 
  OR user_belongs_to_org(auth.uid(), organization_id) 
  OR ((candidate_email)::text = get_user_email(auth.uid()))
);

-- Create secure UPDATE policy (remove anonymous full-table access)
-- Anonymous updates are only allowed for specific invitation (matched by token in application logic)
CREATE POLICY "invitations_update" ON public.test_invitations
FOR UPDATE
USING (
  is_admin(auth.uid()) 
  OR (is_employer(auth.uid()) AND user_belongs_to_org(auth.uid(), organization_id)) 
  OR ((candidate_email)::text = get_user_email(auth.uid()))
);

-- Fix storage policy for company-logos bucket to require authentication
DROP POLICY IF EXISTS "Anyone can upload company logos" ON storage.objects;

-- Create secure upload policy requiring authentication
CREATE POLICY "Authenticated users can upload company logos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
);

-- Fix test_results SELECT policy to remove anonymous access
DROP POLICY IF EXISTS "results_select" ON public.test_results;

CREATE POLICY "results_select" ON public.test_results
FOR SELECT
USING (
  is_admin(auth.uid()) 
  OR user_belongs_to_org(auth.uid(), organization_id) 
  OR ((candidate_email)::text = get_user_email(auth.uid()))
);

-- Fix test_results INSERT policy to remove anonymous access
DROP POLICY IF EXISTS "results_insert" ON public.test_results;

CREATE POLICY "results_insert" ON public.test_results
FOR INSERT
WITH CHECK (
  ((candidate_email)::text = get_user_email(auth.uid()))
  OR is_admin(auth.uid())
);
