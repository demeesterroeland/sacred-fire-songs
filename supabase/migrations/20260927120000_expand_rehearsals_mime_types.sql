-- Migration: Expand Rehearsals Bucket Allowed Mime Types & Size Limit
-- Date: 2026-09-27

UPDATE storage.buckets
SET 
    file_size_limit = 26214400, -- 25 MB to match the UI limit
    allowed_mime_types = ARRAY[
        'audio/webm', 
        'audio/mp4', 
        'audio/mpeg',
        'audio/mp3', 
        'audio/ogg', 
        'audio/wav',
        'audio/x-m4a',
        'audio/m4a',
        'audio/aac',
        'audio/flac',
        'audio/opus'
    ]
WHERE id = 'rehearsals';
