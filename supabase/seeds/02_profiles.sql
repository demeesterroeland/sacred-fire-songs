-- 2. Ensure Profiles exist with correct roles
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'admin@sfs.example',
        'admin',
        'Local Admin'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'expert@sfs.example',
        'expert',
        'Local Expert'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'member@sfs.example',
        'member',
        'Local Member'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'gatekeeper@sfs.example',
        'gatekeeper',
        'Local Gatekeeper'
    ) ON CONFLICT (id) DO
UPDATE
SET role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;