-- Migration: Add gatekeeper role to enum and allow curators to update public setlists
-- Date: 2026-07-15

-- 1. Add gatekeeper to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gatekeeper';

-- 2. Create update policy for public setlists
DROP POLICY IF EXISTS "Admins and Gatekeepers can update public setlists" ON public.setlists;

CREATE POLICY "Admins and Gatekeepers can update public setlists" ON public.setlists
FOR UPDATE
TO authenticated
USING (
  is_public = true 
  AND (
    SELECT role::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) IN ('admin', 'gatekeeper')
);
