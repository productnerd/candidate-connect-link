-- Allow anonymous (Basic) invitations by permitting NULL organization_id
ALTER TABLE public.test_invitations
  ALTER COLUMN organization_id DROP NOT NULL;