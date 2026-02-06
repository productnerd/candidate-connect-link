-- Update check_domain_invite_limit to exclude common public email domains
CREATE OR REPLACE FUNCTION public.check_domain_invite_limit(sender_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sender_domain text;
  invite_count integer;
  -- Comprehensive list of public/free email domains to exclude from domain limits
  public_domains text[] := ARRAY[
    -- Google
    'gmail.com', 'googlemail.com',
    -- Microsoft
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
    -- Yahoo
    'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.it', 'yahoo.es', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in', 'yahoo.co.jp', 'ymail.com', 'rocketmail.com',
    -- Apple
    'icloud.com', 'me.com', 'mac.com',
    -- AOL
    'aol.com', 'aim.com',
    -- ProtonMail
    'protonmail.com', 'protonmail.ch', 'proton.me', 'pm.me',
    -- Zoho
    'zoho.com', 'zohomail.com',
    -- Mail.com
    'mail.com', 'email.com',
    -- GMX
    'gmx.com', 'gmx.net', 'gmx.de', 'gmx.at', 'gmx.ch',
    -- Yandex
    'yandex.com', 'yandex.ru', 'ya.ru',
    -- Mail.ru
    'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
    -- Others
    'fastmail.com', 'fastmail.fm', 'tutanota.com', 'tutanota.de', 'tutamail.com', 'tuta.io',
    'hey.com', 'disroot.org', 'mailfence.com', 'posteo.de', 'posteo.net',
    'runbox.com', 'mailbox.org', 'kolabnow.com', 'startmail.com',
    -- Temporary/disposable (commonly used)
    'guerrillamail.com', 'temp-mail.org', 'tempmail.com', '10minutemail.com',
    -- ISP emails (common ones)
    'att.net', 'sbcglobal.net', 'bellsouth.net', 'comcast.net', 'verizon.net', 'cox.net', 'charter.net',
    'btinternet.com', 'virginmedia.com', 'sky.com', 'talktalk.net',
    'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'laposte.net',
    't-online.de', 'web.de', 'freenet.de',
    -- Educational (generic patterns would need more complex logic, but common ones)
    'edu.com'
  ];
BEGIN
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  -- If it's a public email domain, don't apply domain limits (they still have per-sender limits)
  IF sender_domain = ANY(public_domains) THEN
    RETURN true;
  END IF;
  
  SELECT COUNT(*) INTO invite_count
  FROM public.test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  RETURN invite_count < 10;
END;
$function$;

-- Update get_domain_invite_count to exclude common public email domains
CREATE OR REPLACE FUNCTION public.get_domain_invite_count(sender_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sender_domain text;
  invite_count integer;
  -- Same comprehensive list of public/free email domains
  public_domains text[] := ARRAY[
    -- Google
    'gmail.com', 'googlemail.com',
    -- Microsoft
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
    -- Yahoo
    'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.it', 'yahoo.es', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in', 'yahoo.co.jp', 'ymail.com', 'rocketmail.com',
    -- Apple
    'icloud.com', 'me.com', 'mac.com',
    -- AOL
    'aol.com', 'aim.com',
    -- ProtonMail
    'protonmail.com', 'protonmail.ch', 'proton.me', 'pm.me',
    -- Zoho
    'zoho.com', 'zohomail.com',
    -- Mail.com
    'mail.com', 'email.com',
    -- GMX
    'gmx.com', 'gmx.net', 'gmx.de', 'gmx.at', 'gmx.ch',
    -- Yandex
    'yandex.com', 'yandex.ru', 'ya.ru',
    -- Mail.ru
    'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
    -- Others
    'fastmail.com', 'fastmail.fm', 'tutanota.com', 'tutanota.de', 'tutamail.com', 'tuta.io',
    'hey.com', 'disroot.org', 'mailfence.com', 'posteo.de', 'posteo.net',
    'runbox.com', 'mailbox.org', 'kolabnow.com', 'startmail.com',
    -- Temporary/disposable (commonly used)
    'guerrillamail.com', 'temp-mail.org', 'tempmail.com', '10minutemail.com',
    -- ISP emails (common ones)
    'att.net', 'sbcglobal.net', 'bellsouth.net', 'comcast.net', 'verizon.net', 'cox.net', 'charter.net',
    'btinternet.com', 'virginmedia.com', 'sky.com', 'talktalk.net',
    'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'laposte.net',
    't-online.de', 'web.de', 'freenet.de',
    -- Educational (generic patterns would need more complex logic, but common ones)
    'edu.com'
  ];
BEGIN
  sender_domain := lower(split_part(sender_email, '@', 2));
  
  -- If it's a public email domain, return 0 (no domain limit applies)
  IF sender_domain = ANY(public_domains) THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO invite_count
  FROM public.test_invitations
  WHERE lower(split_part(inviter_email, '@', 2)) = sender_domain
    AND test_type = 'basic'
    AND organization_id IS NULL;
  
  RETURN invite_count;
END;
$function$;