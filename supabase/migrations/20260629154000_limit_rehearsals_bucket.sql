-- Migration: Limit Rehearsals Bucket File Size & Allowed Mime Types
-- Date: 2026-06-29

UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10 MB in bytes
    allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
WHERE id = 'rehearsals';
