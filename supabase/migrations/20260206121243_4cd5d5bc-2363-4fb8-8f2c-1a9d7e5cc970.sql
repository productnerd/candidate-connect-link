
CREATE OR REPLACE FUNCTION public.check_sender_total_limit(sender_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COUNT(*) < 10
  FROM test_invitations
  WHERE inviter_email = sender_email
    AND test_type = 'basic'
    AND organization_id IS NULL
$$;
