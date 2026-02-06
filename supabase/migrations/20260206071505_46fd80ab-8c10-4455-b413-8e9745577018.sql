-- Create function to check domain invite count
-- Returns true if domain can send (under 10 invites), false if limit reached
CREATE OR REPLACE FUNCTION check_domain_invite_limit(sender_email text)
RETURNS boolean AS $$
DECLARE
  sender_domain text;
  invite_count integer;
BEGIN
  -- Extract domain from email (everything after @)
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  -- Count all invitations from this domain (unpaid/basic invitations only)
  SELECT COUNT(*) INTO invite_count
  FROM test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  -- Return true if under 10, false if 10 or more
  RETURN invite_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get the count for frontend display
CREATE OR REPLACE FUNCTION get_domain_invite_count(sender_email text)
RETURNS integer AS $$
DECLARE
  sender_domain text;
  invite_count integer;
BEGIN
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  SELECT COUNT(*) INTO invite_count
  FROM test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  RETURN invite_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;