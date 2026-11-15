-- Comprehensive Seed Data for Local Development
-- Consolidates users, songs, and YouTube links.
-- 1. Setup Dev Test Users (Persistent UUIDs for local dev)
-- Password for all is 'sacred-fire-dev'
INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        email_change_token_current,
        phone_change_token,
        reauthentication_token
    )
VALUES (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@sfs.example',
        extensions.crypt('sacred-fire-dev', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'expert@sfs.example',
        extensions.crypt('sacred-fire-dev', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'member@sfs.example',
        extensions.crypt('sacred-fire-dev', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'gatekeeper@sfs.example',
        extensions.crypt('sacred-fire-dev', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO
UPDATE
SET encrypted_password = EXCLUDED.encrypted_password;
-- 1b. Linked Identities (Required by GoTrue for login)
INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"admin@sfs.example"}',
        'email',
        'admin@sfs.example',
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12","email":"expert@sfs.example"}',
        'email',
        'expert@sfs.example',
        now(),
        now()
    ),
    (
        extensions.gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13","email":"member@sfs.example"}',
        'email',
        'member@sfs.example',
        now(),
        now()
    ),
    (
        extensions.gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14","email":"gatekeeper@sfs.example"}',
        'email',
        'gatekeeper@sfs.example',
        now(),
        now()
    ) ON CONFLICT (provider_id, provider) DO NOTHING;