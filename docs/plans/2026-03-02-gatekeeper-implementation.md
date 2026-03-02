# Gatekeeper Role — Implementation Plan

**Version:** 1.0
**Date:** March 2, 2026
**Status:** Draft

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Gatekeeper role — a curator role between Member and Admin. Gatekeepers can flag songs, edit metadata, merge duplicates, and feature playlists — without destructive delete permissions.

**Architecture:** The Gatekeeper role shares DB migration with the musician→is_musician migration (see `2026-02-28-musician-to-profile-setting.md` Task 1). This plan covers the remaining Gatekeeper-specific features after the role enum exists.

**Tech Stack:** Next.js 15, Supabase (Postgres + RLS), TypeScript, Tailwind CSS, Sonner toasts, vitest

---

## Context

**Prerequisite:** The `gatekeeper` role must exist in the `user_role` enum and the `is_musician` column must exist on `profiles`. This is covered in `2026-02-28-musician-to-profile-setting.md` Task 1.

**Current role enum (after musician migration):** `('admin', 'gatekeeper', 'member')`

Key files to know:
- `hooks/useAuth.tsx` — defines `UserRole`, `AuthUser`, `MOCK_USERS`
- `components/home/SongCard.tsx` — song cards with flag badges
- `app/songs/[id]/page.tsx` — song detail with metadata editing
- `app/library/playlists/page.tsx` — playlist library with featured section
- `app/gatekeeper/page.tsx` — the new Gatekeeper dashboard (to create)
- `app/actions/flagSong.ts` — server action for flagging (to create)
- `app/actions/mergeSongs.ts` — server action for merging (to create)
- `app/actions/featurePlaylist.ts` — server action for featuring (to create)

---

## Task 1: DB Migration — Add Gatekeeper-specific columns

**Files:**
- Create: `supabase/migrations/20260302120000_gatekeeper_columns.sql`
- Modify: `docs/design/db-schema.sql`

### Step 1: Create the migration file

```sql
-- supabase/migrations/20260302120000_gatekeeper_columns.sql

-- 1. Add flagging columns to compositions
ALTER TABLE public.compositions
  ADD COLUMN IF NOT EXISTS flag_status text CHECK (flag_status IN ('needs_improvement', 'duplicate')),
  ADD COLUMN IF NOT EXISTS flagged_by uuid references public.profiles(id),
  ADD COLUMN IF NOT EXISTS flagged_at timestamptz;

-- 2. Add is_featured to setlists
ALTER TABLE public.setlists
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- 3. Add attribution column for last_editor
ALTER TABLE public.compositions
  ADD COLUMN IF NOT EXISTS last_edited_by uuid references public.profiles(id);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('flagged', 'unflagged', 'merged', 'featured')),
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 5. Create indexes for gatekeeper queries
CREATE INDEX IF NOT EXISTS idx_compositions_flag_status ON public.compositions (flag_status, flagged_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read) where is_read = false;
CREATE INDEX IF NOT EXISTS idx_setlists_is_featured ON public.setlists (is_featured desc, created_at desc) where is_featured = true;
```

### Step 2: Apply the migration locally

```bash
npx supabase db reset
# OR if you want incremental:
npx supabase migration up
```

Expected: No errors.

### Step 3: Update docs/design/db-schema.sql

Add the new columns to the compositions table definition (find `);` at end of compositions create table and add before it):

```sql
-- Add after last column in compositions table
, flag_status text check (flag_status in ('needs_improvement', 'duplicate'))
, flagged_by uuid references public.profiles(id)
, flagged_at timestamptz
, last_edited_by uuid references public.profiles(id)
```

Add is_featured to setlists:

```sql
, is_featured boolean default false
```

Add the notifications table (after setlists definition):

```sql
-- NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('flagged', 'unflagged', 'merged', 'featured')),
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);
```

### Step 4: Commit

```bash
git add supabase/migrations/20260302120000_gatekeeper_columns.sql docs/design/db-schema.sql
git commit -m "feat: add gatekeeper columns — flag_status, is_featured, notifications"
```

---

## Task 2: TypeScript Types & Mock Data

**Files:**
- Modify: `hooks/useAuth.tsx`

### Step 1: Add Gatekeeper role check helper

In `hooks/useAuth.tsx`, add a helper function after the type definitions:

```typescript
export function isGatekeeper(role: UserRole): boolean {
  return role === 'gatekeeper';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
```

### Step 2: Add mock-gatekeeper to MOCK_USERS

Add the gatekeeper mock user (if not already added in the musician migration):

```typescript
'mock-gatekeeper': {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'gatekeeper@mock.com',
    role: 'gatekeeper' as UserRole,
    is_musician: false,
    full_name: 'Mock Gatekeeper',
    avatar_url: undefined
},
```

### Step 3: Commit

```bash
git add hooks/useAuth.tsx
git commit -m "feat: add isGatekeeper helper and mock-gatekeeper user"
```

---

## Task 3: Dev Tooling — QuickSwitch Rename

**Files:**
- Rename: `components/dev/MockRoleSwitcher.tsx` → `components/dev/QuickSwitch.tsx`
- Modify: `hooks/useAuth.tsx` (export name)
- Modify: All files importing MockRoleSwitcher

### Step 1: Rename the component file

Move `components/dev/MockRoleSwitcher.tsx` to `components/dev/QuickSwitch.tsx` and update the internal export name.

### Step 2: Find all imports

```bash
grep -rn "MockRoleSwitcher" --include="*.tsx" --include="*.ts" .
```

Update each import to `QuickSwitch`.

### Step 3: Update useAuth export

In `hooks/useAuth.tsx`, change the export if it references `MockRoleSwitcher`.

### Step 4: Verify dev tools render correctly

```bash
npm run dev
```

Confirm:
- QuickSwitch shows all 5 personas: Guest, Member, Member (Musician), Gatekeeper, Admin
- Switching to Gatekeeper shows the new role

### Step 5: Commit

```bash
git add components/dev/QuickSwitch.tsx components/dev/MockRoleSwitcher.tsx
git mv components/dev/MockRoleSwitcher.tsx components/dev/QuickSwitch.tsx
git add -A
git commit -m "refactor: rename MockRoleSwitcher to QuickSwitch with gatekeeper option"
```

---

## Task 4: Song Card Flag Badges

**Files:**
- Modify: `components/home/SongCard.tsx`

### Step 1: Add flag prop to SongCard

Update the SongCard interface to include flag status:

```typescript
interface SongCardProps {
  // ...existing props
  flagStatus?: 'needs_improvement' | 'duplicate' | null;
}
```

Update the function signature:

```typescript
export default function SongCard({
  // ...existing params
  flagStatus = null,
}: SongCardProps) {
```

### Step 2: Add flag badge UI

Add after the existing badges (chords, melody) — something like:

```tsx
{flagStatus && (
  <div className={`text-xs px-2 py-0.5 rounded-full ${
    flagStatus === 'needs_improvement' 
      ? 'bg-amber-500/20 text-amber-500' 
      : 'bg-purple-500/20 text-purple-500'
  }`}>
    {flagStatus === 'needs_improvement' ? 'Needs Improvement' : 'Duplicate'}
  </div>
)}
```

### Step 3: Pass flagStatus from parent components

Update callers to pass `flagStatus`:
- `app/songs/SongsPageContent.tsx` — add to SongCard props
- `app/page.tsx` — add to SongCard props

### Step 4: Commit

```bash
git add components/home/SongCard.tsx app/songs/SongsPageContent.tsx app/page.tsx
git commit -m "feat: add flag status badges to song cards"
```

---

## Task 5: Flag Song Server Action

**Files:**
- Create: `app/actions/flagSong.ts`

### Step 1: Create the server action

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const flagSchema = z.object({
  compositionId: z.string().uuid(),
  flagType: z.enum(['needs_improvement', 'duplicate']),
});

export async function flagSong(
  compositionId: string,
  flagType: 'needs_improvement' | 'duplicate'
) {
  const parsed = flagSchema.parse({ compositionId, flagType });
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    return { error: 'Only gatekeepers can flag songs' };
  }
  
  const { data: composition } = await supabase
    .from('compositions')
    .select('id, title, owner_id')
    .eq('id', parsed.compositionId)
    .maybeSingle();
  
  if (!composition) return { error: 'Song not found' };
  
  const { error } = await supabase
    .from('compositions')
    .update({
      flag_status: parsed.flagType,
      flagged_by: user.id,
      flagged_at: new Date().toISOString(),
    })
    .eq('id', parsed.compositionId);
  
  if (error) return { error: error.message };
  
  await supabase.from('notifications').insert({
    user_id: composition.owner_id,
    type: 'flagged',
    title: `Your song "${composition.title}" was flagged`,
    message: flagType === 'needs_improvement' 
      ? 'This song needs improvement. Please review and update.'
      : 'This song was marked as a duplicate.',
    link: `/songs/${composition.id}`,
  });
  
  revalidatePath('/songs');
  revalidatePath(`/songs/${compositionId}`);
  return { success: true };
}

export async function unflagSong(compositionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    return { error: 'Only gatekeepers can unflag songs' };
  }
  
  const { data: composition } = await supabase
    .from('compositions')
    .select('id, title, owner_id')
    .eq('id', compositionId)
    .maybeSingle();
  
  const { error } = await supabase
    .from('compositions')
    .update({
      flag_status: null,
      flagged_by: null,
      flagged_at: null,
    })
    .eq('id', compositionId);
  
  if (error) return { error: error.message };
  
  if (composition?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: composition.owner_id,
      type: 'unflagged',
      title: `Your song "${composition.title}" was unflagged`,
      message: 'The flag has been removed from your song.',
      link: `/songs/${compositionId}`,
    });
  }
  
  revalidatePath('/songs');
  revalidatePath(`/songs/${compositionId}`);
  return { success: true };
}
```

### Step 2: Commit

```bash
git add app/actions/flagSong.ts
git commit -m "feat: add flagSong/unflagSong server actions with notifications"
```

---

## Task 6: Gatekeeper Dashboard

**Files:**
- Create: `app/gatekeeper/page.tsx`
- Create: `app/gatekeeper/GatekeeperQueue.tsx`

### Step 1: Create the dashboard page

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GatekeeperQueue from './GatekeeperQueue';

export default async function GatekeeperPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    redirect('/');
  }
  
  const { data: flaggedSongs } = await supabase
    .from('compositions')
    .select(`
      id,
      title,
      original_author,
      flag_status,
      flagged_at,
      flagged_by:profiles!flagged_by(full_name),
      owner_id,
      owners:profiles!compositions_owner_id_fkey(full_name)
    `)
    .not('flag_status', 'is', null)
    .order('flagged_at', { ascending: false });
  
  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Gatekeeper Queue</h1>
        <GatekeeperQueue initialSongs={flaggedSongs || []} />
      </div>
    </div>
  );
}
```

### Step 2: Create the client queue component

```tsx
'use client';

import { useState } from 'react';
import { flagSong, unflagSong } from '@/app/actions/flagSong';
import { AlertTriangle, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FlaggedSong {
  id: string;
  title: string;
  original_author: string | null;
  flag_status: 'needs_improvement' | 'duplicate';
  flagged_at: string;
  flagged_by?: { full_name: string | null };
  owner_id: string;
  owners?: { full_name: string | null }[];
}

export default function GatekeeperQueue({ initialSongs }: { initialSongs: FlaggedSong[] }) {
  const [songs, setSongs] = useState(initialSongs);
  const [filter, setFilter] = useState<'all' | 'needs_improvement' | 'duplicate'>('all');
  
  const filteredSongs = filter === 'all' 
    ? songs 
    : songs.filter(s => s.flag_status === filter);
  
  const handleUnflag = async (songId: string) => {
    const result = await unflagSong(songId);
    if (result.success) {
      toast.success('Song unflagged');
      setSongs(songs.filter(s => s.id !== songId));
    } else {
      toast.error(result.error);
    }
  };
  
  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-400">All caught up! No flagged songs.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['all', 'needs_improvement', 'duplicate'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-red-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'All' : f === 'needs_improvement' ? 'Needs Improvement' : 'Duplicates'}
            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
              {f === 'all' ? songs.length : songs.filter(s => s.flag_status === f).length}
            </span>
          </button>
        ))}
      </div>
      
      <div className="space-y-3">
        {filteredSongs.map(song => (
          <div
            key={song.id}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-4">
              {song.flag_status === 'needs_improvement' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Copy className="w-5 h-5 text-purple-500" />
              )}
              <div>
                <p className="font-medium text-white">{song.title}</p>
                <p className="text-sm text-gray-500">
                  by {song.original_author || 'Unknown'} • Flagged {new Date(song.flagged_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <a
                href={`/songs/${song.id}`}
                className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
              >
                View
              </a>
              {song.flag_status === 'duplicate' && (
                <button
                  className="px-3 py-1.5 text-sm bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                >
                  Merge
                </button>
              )}
              <button
                onClick={() => handleUnflag(song.id)}
                className="px-3 py-1.5 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 3: Add link in nav for gatekeepers

In the main navigation component, add a link that only appears for gatekeeper/admin:

```tsx
{(user?.role === 'gatekeeper' || user?.role === 'admin') && (
  <a href="/gatekeeper" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white">
    <ShieldCheck className="w-4 h-4" />
    Gatekeeper
  </a>
)}
```

### Step 4: Commit

```bash
git add app/gatekeeper/page.tsx app/gatekeeper/GatekeeperQueue.tsx
git commit -m "feat: add gatekeeper queue dashboard"
```

---

## Task 7: Metadata Editing for Gatekeepers

**Files:**
- Modify: `app/songs/[id]/page.tsx` (or create `components/song/SongMetadataEditor.tsx`)

### Step 1: Create metadata editor component

Create `components/song/SongMetadataEditor.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { updateSongMetadata } from '@/app/actions/updateSongMetadata';
import { toast } from 'sonner';

interface MetadataEditorProps {
  songId: string;
  initialData: {
    youtube_url?: string;
    soundcloud_url?: string;
    spotify_url?: string;
    key?: string;
    capo?: number;
  };
  isGatekeeper: boolean;
}

export default function SongMetadataEditor({ songId, initialData, isGatekeeper }: MetadataEditorProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(initialData.youtube_url || '');
  const [soundcloudUrl, setSoundcloudUrl] = useState(initialData.soundcloud_url || '');
  const [spotifyUrl, setSpotifyUrl] = useState(initialData.spotify_url || '');
  const [songKey, setSongKey] = useState(initialData.key || '');
  const [capo, setCapo] = useState(initialData.capo || 0);
  const [isSaving, setIsSaving] = useState(false);
  
  if (!isGatekeeper) return null;
  
  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSongMetadata(songId, {
      youtube_url: youtubeUrl || null,
      soundcloud_url: soundcloudUrl || null,
      spotify_url: spotifyUrl || null,
      key: songKey || null,
      capo,
    });
    
    if (result.success) {
      toast.success('Metadata updated');
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };
  
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Metadata (Gatekeeper Edit)
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">SoundCloud URL</label>
          <input
            type="url"
            value={soundcloudUrl}
            onChange={e => setSoundcloudUrl(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Spotify URL</label>
          <input
            type="url"
            value={spotifyUrl}
            onChange={e => setSpotifyUrl(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Key</label>
            <input
              type="text"
              value={songKey}
              onChange={e => setSongKey(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Am"
            />
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Capo</label>
            <input
              type="number"
              min="0"
              max="12"
              value={capo}
              onChange={e => setCapo(parseInt(e.target.value) || 0)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isSaving ? 'Saving...' : 'Save Metadata'}
      </button>
    </div>
  );
}
```

### Step 2: Create server action

Create `app/actions/updateSongMetadata.ts`:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const metadataSchema = z.object({
  compositionId: z.string().uuid(),
  youtube_url: z.string().url().nullable(),
  soundcloud_url: z.string().url().nullable(),
  spotify_url: z.string().url().nullable(),
  key: z.string().nullable(),
  capo: z.number().int().min(0).max(12),
});

export async function updateSongMetadata(
  compositionId: string,
  data: {
    youtube_url?: string | null;
    soundcloud_url?: string | null;
    spotify_url?: string | null;
    key?: string | null;
    capo?: number;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    return { error: 'Only gatekeepers can edit metadata' };
  }
  
  const updateData: Record<string, unknown> = {
    last_edited_by: user.id,
  };
  
  if (data.youtube_url !== undefined) updateData.youtube_url = data.youtube_url;
  if (data.soundcloud_url !== undefined) updateData.soundcloud_url = data.soundcloud_url;
  if (data.spotify_url !== undefined) updateData.spotify_url = data.spotify_url;
  
  const { error } = await supabase
    .from('compositions')
    .update(updateData)
    .eq('id', compositionId);
  
  if (error) return { error: error.message };
  
  if (data.key !== undefined || data.capo !== undefined) {
    const { data: version } = await supabase
      .from('song_versions')
      .select('id')
      .eq('composition_id', compositionId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (version) {
      await supabase
        .from('song_versions')
        .update({
          key: data.key,
          capo: data.capo ?? 0,
        })
        .eq('id', version.id);
    }
  }
  
  revalidatePath(`/songs/${compositionId}`);
  return { success: true };
}
```

### Step 3: Integrate into song detail page

Add the metadata editor to `app/songs/[id]/page.tsx` for gatekeepers.

### Step 4: Commit

```bash
git add components/song/SongMetadataEditor.tsx app/actions/updateSongMetadata.ts
git commit -m "feat: add metadata editor for gatekeepers"
```

---

## Task 8: Featured Playlists

**Files:**
- Create: `app/actions/featurePlaylist.ts`
- Modify: `app/library/playlists/page.tsx`

### Step 1: Create feature playlist server action

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function featurePlaylist(playlistId: string, featured: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    return { error: 'Only gatekeepers can feature playlists' };
  }
  
  const { error } = await supabase
    .from('setlists')
    .update({ is_featured: featured })
    .eq('id', playlistId);
  
  if (error) return { error: error.message };
  
  revalidatePath('/library/playlists');
  return { success: true };
}
```

### Step 2: Add Featured section to playlists page

In `app/library/playlists/page.tsx`, fetch and display featured playlists above the public playlists section:

```tsx
const { data: featuredPlaylists } = await supabase
  .from('setlists')
  .select('id, title, description, owner_id, created_at, profiles(full_name)')
  .eq('is_featured', true)
  .order('created_at', { ascending: false });

// Add UI section before "Public Playlists":
{featuredPlaylists && featuredPlaylists.length > 0 && (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Star className="w-5 h-5 text-amber-500" />
      Featured Playlists
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {featuredPlaylists.map(playlist => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  </section>
)}
```

### Step 3: Add context menu option for gatekeepers

In the playlist card or context menu, add a "Feature" / "Unfeature" option that appears only for gatekeepers:

```tsx
{(user?.role === 'gatekeeper' || user?.role === 'admin') && (
  <button
    onClick={() => featurePlaylist(playlist.id, !playlist.is_featured)}
    className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
  >
    {playlist.is_featured ? 'Remove from Featured' : 'Feature this Playlist'}
  </button>
)}
```

### Step 4: Commit

```bash
git add app/actions/featurePlaylist.ts app/library/playlists/page.tsx
git commit -m "feat: add featured playlists feature for gatekeepers"
```

---

## Task 9: Duplicate Merging

**Files:**
- Create: `app/actions/mergeSongs.ts`
- Modify: `app/gatekeeper/GatekeeperQueue.tsx` (add merge UI)

### Step 1: Create merge server action

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function mergeSongs(canonicalId: string, duplicateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'gatekeeper' && profile?.role !== 'admin') {
    return { error: 'Only gatekeepers can merge songs' };
  }
  
  const { data: canonical } = await supabase
    .from('compositions')
    .select('id, title, owner_id')
    .eq('id', canonicalId)
    .maybeSingle();
  
  const { data: duplicate } = await supabase
    .from('compositions')
    .select('id, title, owner_id')
    .eq('id', duplicateId)
    .maybeSingle();
  
  if (!canonical || !duplicate) return { error: 'Songs not found' };
  
  await supabase
    .from('compositions')
    .update({
      flag_status: null,
      flagged_by: null,
      flagged_at: null,
      merged_into_id: canonical.id,
    })
    .eq('id', duplicate.id);
  
  await supabase.from('notifications').insert({
    user_id: canonical.owner_id,
    type: 'merged',
    title: `Song "${duplicate.title}" was merged into "${canonical.title}"`,
    message: 'Your song is now an alternate version of the canonical entry.',
    link: `/songs/${canonical.id}`,
  });
  
  await supabase.from('notifications').insert({
    user_id: duplicate.owner_id,
    type: 'merged',
    title: `Your song "${duplicate.title}" was merged`,
    message: `This song has been merged into "${canonical.title}".`,
    link: `/songs/${canonical.id}`,
  });
  
  revalidatePath('/songs');
  revalidatePath('/gatekeeper');
  return { success: true };
}
```

Add `merged_into_id` column to compositions via migration if needed.

### Step 2: Add merge UI to Gatekeeper Queue

Add a "Select to Merge" mode that lets gatekeepers pick a canonical song.

### Step 3: Commit

```bash
git add app/actions/mergeSongs.ts
git commit -m "feat: add duplicate song merging for gatekeepers"
```

---

## Task 10: Notifications UI

**Files:**
- Create: `components/notifications/NotificationsDropdown.tsx`
- Modify: Layout component to include notifications bell

### Step 1: Create notifications component

Create a dropdown that shows unread notifications with links.

### Step 2: Add to layout

Add the notifications bell in the main nav bar.

### Step 3: Commit

```bash
git add components/notifications/NotificationsDropdown.tsx
git commit -m "feat: add notifications dropdown for users"
```

---

## Task 11: Tests

**Files:**
- Create: `lib/unit-tests/gatekeeper.test.ts`

### Step 1: Write tests for permission checks

```typescript
import { describe, it, expect } from 'vitest';
import { isGatekeeper, isAdmin } from '@/hooks/useAuth';

describe('role helpers', () => {
  it('returns true for gatekeeper', () => {
    expect(isGatekeeper('gatekeeper')).toBe(true);
  });
  
  it('returns false for member', () => {
    expect(isGatekeeper('member')).toBe(false);
  });
  
  it('returns true for admin', () => {
    expect(isAdmin('admin')).toBe(true);
  });
});
```

### Step 2: Run tests

```bash
npx vitest run lib/unit-tests/gatekeeper.test.ts
```

### Step 3: Commit

```bash
git add lib/unit-tests/gatekeeper.test.ts
git commit -m "test: add gatekeeper role helper tests"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | DB columns for flags, featured, notifications | Migration + db-schema.sql |
| 2 | TypeScript helpers + mock data | `hooks/useAuth.tsx` |
| 3 | QuickSwitch rename | `components/dev/QuickSwitch.tsx` |
| 4 | Song card flag badges | `components/home/SongCard.tsx` |
| 5 | Flag/unflag server actions | `app/actions/flagSong.ts` |
| 6 | Gatekeeper dashboard | `app/gatekeeper/page.tsx` |
| 7 | Metadata editor | `components/song/SongMetadataEditor.tsx`, `app/actions/updateSongMetadata.ts` |
| 8 | Featured playlists | `app/actions/featurePlaylist.ts`, playlists page |
| 9 | Duplicate merging | `app/actions/mergeSongs.ts` |
| 10 | Notifications UI | `components/notifications/NotificationsDropdown.tsx` |
| 11 | Tests | `lib/unit-tests/gatekeeper.test.ts` |

**Parallelization:**
- Tasks 1-3 are independent and can be done first
- Task 4 (badges) depends on Task 1 (DB columns exist)
- Tasks 5-6 can be done together (flagging → queue)
- Tasks 7-9 are independent of each other
- Task 10 depends on Tasks 5, 7, 9 (notifications are created by those actions)
- Task 11 can be done anytime after Task 2
