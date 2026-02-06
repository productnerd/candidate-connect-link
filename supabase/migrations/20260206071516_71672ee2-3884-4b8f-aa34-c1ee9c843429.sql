-- Fix search_path security warnings for domain invite limit functions
CREATE OR REPLACE FUNCTION check_domain_invite_limit(sender_email text)
RETURNS boolean AS $$
DECLARE
  sender_domain text;
  invite_count integer;
BEGIN
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  SELECT COUNT(*) INTO invite_count
  FROM public.test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  RETURN invite_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_domain_invite_count(sender_email text)
RETURNS integer AS $$
DECLARE
  sender_domain text;
  invite_count integer;
BEGIN
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  SELECT COUNT(*) INTO invite_count
  FROM public.test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  RETURN invite_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;