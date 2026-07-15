-- 2. Ensure Profiles exist with correct roles
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'roel.de.meester+admin@gmail.com',
        'admin',
        'Local Admin'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'roel.de.meester+musician@gmail.com',
        'musician',
        'Local Musician'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'roel.de.meester+member@gmail.com',
        'member',
        'Local Member'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'roel.de.meester+gatekeeper@gmail.com',
        'gatekeeper',
        'Local Gatekeeper'
    ) ON CONFLICT (id) DO
UPDATE
SET role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;