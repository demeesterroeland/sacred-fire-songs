-- Migration: Add file_size_bytes column to user_recordings metadata table
-- Date: 2026-08-10

ALTER TABLE public.user_recordings 
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;
