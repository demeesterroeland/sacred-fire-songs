-- Migration: Add duration_seconds column to user_recordings metadata table
-- Created at: 2026-09-27

ALTER TABLE public.user_recordings 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

