-- Add columns for anonymous employer flow with company branding
ALTER TABLE test_invitations
ADD COLUMN inviter_email VARCHAR(255),
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN inviter_name VARCHAR(255),
ADD COLUMN company_logo_url TEXT,
ADD COLUMN test_type VARCHAR(50) DEFAULT 'basic' CHECK (test_type IN ('basic', 'premium'));

-- Create index for rate limiting queries
CREATE INDEX idx_invitations_inviter_email_created ON test_invitations(inviter_email, created_at);
CREATE INDEX idx_invitations_candidate_inviter ON test_invitations(candidate_email, inviter_email, created_at);

-- Create function to check if sender can send more tests today (max 3)
CREATE OR REPLACE FUNCTION public.check_sender_daily_limit(sender_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 3
  FROM test_invitations
  WHERE inviter_email = sender_email
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
$$;

-- Create function to check if candidate was already invited by same sender in last 30 days
CREATE OR REPLACE FUNCTION public.check_candidate_cooldown(sender_email TEXT, recipient_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM test_invitations
    WHERE inviter_email = sender_email
      AND candidate_email = recipient_email
      AND created_at >= NOW() - INTERVAL '30 days'
  )
$$;

-- Update RLS policy to allow anonymous inserts for basic tests
DROP POLICY IF EXISTS invitations_insert ON test_invitations;
CREATE POLICY invitations_insert ON test_invitations
FOR INSERT
WITH CHECK (
  -- Authenticated employers inserting for their org
  (is_employer(auth.uid()) AND user_belongs_to_org(auth.uid(), organization_id))
  OR
  -- Anonymous inserts for basic tests (organization_id is null, inviter_email required)
  (auth.uid() IS NULL AND organization_id IS NULL AND inviter_email IS NOT NULL AND test_type = 'basic')
);

-- Allow anonymous users to select their own invitations (for checking rate limits)
DROP POLICY IF EXISTS invitations_select ON test_invitations;
CREATE POLICY invitations_select ON test_invitations
FOR SELECT
USING (
  is_admin(auth.uid()) 
  OR user_belongs_to_org(auth.uid(), organization_id) 
  OR ((candidate_email)::text = get_user_email(auth.uid())) 
  OR (auth.uid() IS NULL)
);