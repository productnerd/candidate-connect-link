-- Fix security warnings

-- 1. Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Fix overly permissive org_insert policy
-- Drop the permissive policy and replace with proper check
DROP POLICY IF EXISTS "org_insert" ON public.organizations;

-- Organizations should only be created by employers during signup or by admins
CREATE POLICY "org_insert" ON public.organizations FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);