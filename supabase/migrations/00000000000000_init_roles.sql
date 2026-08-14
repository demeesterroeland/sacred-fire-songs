-- Migration: 20251231000000_init_roles.sql
-- Ensure Supabase system roles have password access and _realtime schema exists
DO $$
BEGIN
  -- Set passwords for system roles if permitted (self-hosted vs CLI)
  BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
      ALTER ROLE supabase_auth_admin WITH PASSWORD 'postgres';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
      ALTER ROLE supabase_storage_admin WITH PASSWORD 'postgres';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
      ALTER ROLE authenticator WITH PASSWORD 'postgres';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  -- Ensure _realtime schema exists
  CREATE SCHEMA IF NOT EXISTS _realtime;
  GRANT ALL ON SCHEMA _realtime TO supabase_admin;
  GRANT ALL ON SCHEMA _realtime TO postgres;
END $$;
