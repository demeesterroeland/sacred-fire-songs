-- Migration: Admin Profiles & Contributions Access Policy
-- Date: 2026-10-09

-- 1. Create Helper Function (Security Definer) to check if user is admin without RLS recursion
CREATE OR REPLACE FUNCTION public.fn_is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.fn_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_is_admin TO service_role;

-- 2. Allow Admins to read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.fn_is_admin());

-- 3. Allow Admins to read all setlists
DROP POLICY IF EXISTS "Admins can view all setlists" ON public.setlists;
CREATE POLICY "Admins can view all setlists"
ON public.setlists FOR SELECT
TO authenticated
USING (public.fn_is_admin());
