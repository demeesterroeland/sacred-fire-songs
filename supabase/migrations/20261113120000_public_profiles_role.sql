-- Story 6.1.38 (#534): one badge per role on a profile page.
--
-- public_profiles gains the role, so a profile page can show an admin, gatekeeper,
-- expert, musician or member badge. Decision (Nov 12, 2026): every signed-in member
-- may see every role. A guest (no auth.uid()) gets NULL, so the roles of the team are
-- not listed to anyone without an account; the profile page itself is members-only.
-- is_musician stays for existing callers. The new column is appended, as
-- CREATE OR REPLACE VIEW requires.

BEGIN;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false, security_barrier = true) AS
SELECT id,
       full_name,
       avatar_url,
       (role IN ('musician', 'expert')) AS is_musician,
       CASE WHEN (SELECT auth.uid()) IS NULL THEN NULL ELSE role END AS role
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

COMMIT;
