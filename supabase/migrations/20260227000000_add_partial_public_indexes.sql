-- Migration: Add partial indexes for public content optimization
-- Date: 2026-02-27
-- Description: Adds partial indexes to compositions and setlists to optimize public content discovery and RLS performance.

-- 1. Partial index for public compositions
-- Speeds up "Public compositions are viewable by everyone" policy and the main song list.
-- Includes created_at for efficient sorting of newest public songs.
CREATE INDEX IF NOT EXISTS idx_compositions_is_public_true 
ON public.compositions (created_at DESC) 
WHERE is_public = true;

-- 2. Partial index for public setlists
-- Speeds up public setlist discovery and related RLS checks.
CREATE INDEX IF NOT EXISTS idx_setlists_is_public_true 
ON public.setlists (created_at DESC) 
WHERE is_public = true;

-- 3. Composite index for composition titles
-- Speeds up the title-based sorting frequently used in the SongsPageContent.
CREATE INDEX IF NOT EXISTS idx_compositions_title_alphabetical
ON public.compositions (title ASC);
