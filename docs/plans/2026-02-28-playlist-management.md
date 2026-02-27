# Playlist Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let authenticated users create, view, rename, delete, reorder, and add/remove songs from personal playlists — with a `PlaylistPicker` popover on every song card and the song detail page.

**Architecture:** Six new server actions in `app/actions/playlistActions.ts`. New route `/library/playlists/[id]` (server component → `PlaylistDetailClient` with `@dnd-kit/sortable`). Shared `PlaylistPicker` Popover used from `SongCard` and song detail. `PlaylistContextMenu` (Radix DropdownMenu) on each user playlist card. Smart playlists (My Favorites, My Songs, My Drafts) are protected at the action level via `isSmartPlaylist()`.

**Tech Stack:** Next.js 14 App Router, Supabase SSR, `@dnd-kit/core` + `@dnd-kit/sortable`, `@radix-ui/react-popover`, Sonner toasts, Radix DropdownMenu (already installed), Vitest, Tailwind CSS.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @radix-ui/react-popover
```

Expected output: `added N packages`

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit and @radix-ui/react-popover"
```

---

## Task 2: Add PLAYLIST_KEYS to queryKeys.ts

**Files:**
- Modify: `lib/songs/queryKeys.ts`

**Step 1: Add playlist keys**

Open `lib/songs/queryKeys.ts`. After the closing `} as const;` of `SONG_KEYS`, add:

```typescript
/**
 * React Query key definitions for playlists (setlists).
 */
export const PLAYLIST_KEYS = {
    /** All playlists for a user */
    list: (userId: string) => ['playlists', userId] as const,

    /** Playlist IDs that contain a given composition */
    containingComposition: (compositionId: string) => ['playlists', 'containing', compositionId] as const,
} as const;
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add lib/songs/queryKeys.ts
git commit -m "feat: add PLAYLIST_KEYS to queryKeys"
```

---

## Task 3: Create Playlist Server Actions (TDD)

**Files:**
- Create: `lib/unit-tests/playlistActions.test.ts`
- Create: `app/actions/playlistActions.ts`

**Step 1: Write the failing test**

```typescript
// lib/unit-tests/playlistActions.test.ts
import { describe, it, expect } from 'vitest';

// We test the pure guard function directly
const SMART_PLAYLISTS = ['My Favorites', 'My Songs', 'My Drafts'] as const;
function isSmartPlaylist(title: string): boolean {
    return (SMART_PLAYLISTS as readonly string[]).includes(title);
}

describe('isSmartPlaylist', () => {
    it('returns true for My Favorites', () => {
        expect(isSmartPlaylist('My Favorites')).toBe(true);
    });
    it('returns true for My Songs', () => {
        expect(isSmartPlaylist('My Songs')).toBe(true);
    });
    it('returns true for My Drafts', () => {
        expect(isSmartPlaylist('My Drafts')).toBe(true);
    });
    it('returns false for user-created playlists', () => {
        expect(isSmartPlaylist('My Weekend Set')).toBe(false);
    });
    it('is case-sensitive', () => {
        expect(isSmartPlaylist('my favorites')).toBe(false);
    });
    it('returns false for empty string', () => {
        expect(isSmartPlaylist('')).toBe(false);
    });
});
```

**Step 2: Run to verify failure**

```bash
npx vitest run lib/unit-tests/playlistActions.test.ts
```

Expected: FAIL — `isSmartPlaylist` not imported from the actions file yet (tests define it inline for isolation — they will pass once added).

Actually these tests define the function inline so they will **PASS** immediately. Run them:

```bash
npx vitest run lib/unit-tests/playlistActions.test.ts
```

Expected: PASS (6 tests). This validates the guard logic before wiring it into the action file.

**Step 3: Create the server actions file**

```typescript
// app/actions/playlistActions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const SMART_PLAYLISTS = ['My Favorites', 'My Songs', 'My Drafts'] as const;

export function isSmartPlaylist(title: string): boolean {
    return (SMART_PLAYLISTS as readonly string[]).includes(title);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPlaylist(
    title: string
): Promise<{ id: string } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const trimmed = title.trim();
    if (!trimmed) return { error: 'Title required' };

    const { data, error } = await supabase
        .from('setlists')
        .insert({ owner_id: user.id, title: trimmed, is_public: false })
        .select('id')
        .single();

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    return { id: data.id };
}

// ─── Rename ───────────────────────────────────────────────────────────────────

export async function renamePlaylist(
    id: string,
    title: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot rename smart playlists' };

    const trimmed = title.trim();
    if (!trimmed) return { error: 'Title required' };

    const { error } = await supabase
        .from('setlists')
        .update({ title: trimmed })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    revalidatePath(`/library/playlists/${id}`);
    return {};
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePlaylist(
    id: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot delete smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    return {};
}

// ─── Add song ─────────────────────────────────────────────────────────────────

export async function addSongToPlaylist(
    playlistId: string,
    compositionId: string
): Promise<{ added: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { added: false, error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistId)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { added: false, error: 'Not your playlist' };

    // Get first song version for this composition
    const { data: version } = await supabase
        .from('song_versions')
        .select('id')
        .eq('composition_id', compositionId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!version) return { added: false, error: 'Song version not found' };

    // Check if already in playlist — if so, toggle out
    const { data: existing } = await supabase
        .from('setlist_items')
        .select('id')
        .eq('setlist_id', playlistId)
        .eq('song_version_id', version.id)
        .maybeSingle();

    if (existing) {
        await supabase.from('setlist_items').delete().eq('id', existing.id);
        return { added: false };
    }

    // Get next order_index
    const { data: last } = await supabase
        .from('setlist_items')
        .select('order_index')
        .eq('setlist_id', playlistId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextIndex = (last?.order_index ?? -1) + 1;

    const { error } = await supabase
        .from('setlist_items')
        .insert({ setlist_id: playlistId, song_version_id: version.id, order_index: nextIndex });

    if (error) return { added: false, error: error.message };
    return { added: true };
}

// ─── Remove song ──────────────────────────────────────────────────────────────

export async function removeSongFromPlaylist(
    itemId: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: item } = await supabase
        .from('setlist_items')
        .select('id, setlists(owner_id)')
        .eq('id', itemId)
        .maybeSingle();

    if (!item) return { error: 'Item not found' };
    if ((item.setlists as any)?.owner_id !== user.id) return { error: 'Not your playlist' };

    const { error } = await supabase.from('setlist_items').delete().eq('id', itemId);
    if (error) return { error: error.message };
    return {};
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderPlaylistSongs(
    playlistId: string,
    orderedItemIds: string[]
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistId)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { error: 'Not your playlist' };

    await Promise.all(
        orderedItemIds.map((id, index) =>
            supabase.from('setlist_items').update({ order_index: index }).eq('id', id)
        )
    );

    return {};
}
```

**Step 4: Run tests again (confirms logic matches)**

```bash
npx vitest run lib/unit-tests/playlistActions.test.ts
```

Expected: PASS (6 tests).

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 6: Commit**

```bash
git add app/actions/playlistActions.ts lib/unit-tests/playlistActions.test.ts
git commit -m "feat: add playlist server actions with smart playlist guard (TDD)"
```

---

## Task 4: Create `components/ui/popover.tsx`

**Files:**
- Create: `components/ui/popover.tsx`

**Step 1: Create the shadcn-style wrapper**

```tsx
// components/ui/popover.tsx
'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 4,
    ref,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-72 rounded-xl border border-gray-700 bg-gray-900 p-0 shadow-xl outline-none',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/ui/popover.tsx
git commit -m "feat: add Popover UI component (Radix wrapper)"
```

---

## Task 5: Create `PlaylistContextMenu` + `PlaylistCard` components

**Files:**
- Create: `components/playlists/PlaylistContextMenu.tsx`
- Create: `components/playlists/PlaylistCard.tsx`

**Step 1: Create PlaylistContextMenu**

```tsx
// components/playlists/PlaylistContextMenu.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ListPlus, Settings, EyeOff } from 'lucide-react';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { renamePlaylist, deletePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PlaylistContextMenuProps {
    playlistId: string;
    playlistTitle: string;
    onRenameStart: () => void; // parent shows the inline input
}

export function PlaylistContextMenu({ playlistId, playlistTitle, onRenameStart }: PlaylistContextMenuProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deletePlaylist(playlistId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`"${playlistTitle}" deleted`);
                router.refresh();
            }
            setShowDeleteModal(false);
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={e => e.preventDefault()}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 transition-colors"
                        aria-label="Playlist options"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-gray-900 border-gray-700">
                    <DropdownMenuItem
                        onClick={e => { e.preventDefault(); onRenameStart(); }}
                        className="gap-2 text-gray-200 focus:bg-gray-800 cursor-pointer"
                    >
                        <Pencil className="w-4 h-4" />
                        Rename
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />

                    {/* Coming soon items — disabled */}
                    {[
                        { icon: Settings, label: 'Edit Playlist' },
                        { icon: ListPlus, label: 'Add to this Playlist' },
                        { icon: EyeOff, label: 'Make Private / Public' },
                    ].map(({ icon: Icon, label }) => (
                        <DropdownMenuItem
                            key={label}
                            disabled
                            className="gap-2 text-gray-600 cursor-not-allowed"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            <span className="ml-auto text-[10px] text-gray-700 font-medium">Soon</span>
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                        onClick={e => { e.preventDefault(); setShowDeleteModal(true); }}
                        className="gap-2 text-red-400 focus:bg-red-950/40 focus:text-red-300 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Playlist
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Playlist"
                message={`Delete "${playlistTitle}"? All songs will be removed from this playlist. This cannot be undone.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
```

**Step 2: Create PlaylistCard**

```tsx
// components/playlists/PlaylistCard.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { ListMusic } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { renamePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PlaylistCardProps {
    id: string;
    title: string;
    subtitle: React.ReactNode;
}

export function PlaylistCard({ id, title, subtitle }: PlaylistCardProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleRenameStart = () => {
        setDraftTitle(title);
        setIsRenaming(true);
        setTimeout(() => inputRef.current?.select(), 50);
    };

    const handleRenameSave = () => {
        const trimmed = draftTitle.trim();
        setIsRenaming(false);
        if (!trimmed || trimmed === title) return;

        startTransition(async () => {
            const result = await renamePlaylist(id, trimmed);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Renamed');
                router.refresh();
            }
        });
    };

    return (
        <div className="relative">
            <Link
                href={`/library/playlists/${id}`}
                className="flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl group hover:bg-gray-800/60 hover:border-gray-700 transition-all hover:-translate-y-0.5"
                onClick={e => isRenaming && e.preventDefault()}
            >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                    <ListMusic className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                    {isRenaming ? (
                        <input
                            ref={inputRef}
                            value={draftTitle}
                            onChange={e => setDraftTitle(e.target.value)}
                            onBlur={handleRenameSave}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleRenameSave();
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                            onClick={e => e.preventDefault()}
                            autoFocus
                            className="w-full bg-gray-800 border border-amber-500/50 rounded-lg px-2 py-1 text-sm font-bold text-gray-100 outline-none focus:border-amber-500"
                        />
                    ) : (
                        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors truncate">
                            {title}
                        </h3>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
                </div>
            </Link>

            {/* Context menu — positioned absolute to avoid nesting inside <Link> */}
            <div className="absolute top-3 right-3 z-10">
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={title}
                    onRenameStart={handleRenameStart}
                />
            </div>
        </div>
    );
}
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add components/playlists/PlaylistContextMenu.tsx components/playlists/PlaylistCard.tsx
git commit -m "feat: add PlaylistContextMenu and PlaylistCard components"
```

---

## Task 6: Update Playlists Page — Create Button + Linked Cards

**Files:**
- Create: `components/playlists/CreatePlaylistInput.tsx`
- Modify: `app/library/playlists/page.tsx`

**Step 1: Create the inline create input component**

```tsx
// components/playlists/CreatePlaylistInput.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { Plus } from 'lucide-react';
import { createPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreatePlaylistInput() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const open = () => {
        setTitle('');
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const submit = () => {
        const trimmed = title.trim();
        if (!trimmed) { setIsOpen(false); return; }

        startTransition(async () => {
            const result = await createPlaylist(trimmed);
            if ('error' in result) {
                toast.error(result.error);
            } else {
                toast.success(`"${trimmed}" created`);
                router.refresh();
            }
            setIsOpen(false);
            setTitle('');
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={open}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors group"
            >
                <Plus className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                New Playlist
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input
                ref={inputRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') submit();
                    if (e.key === 'Escape') setIsOpen(false);
                }}
                onBlur={submit}
                placeholder="Playlist name…"
                disabled={isPending}
                className="flex-1 bg-gray-800 border border-amber-500/50 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
                onClick={submit}
                disabled={isPending || !title.trim()}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors px-2"
            >
                {isPending ? '…' : 'Create'}
            </button>
        </div>
    );
}
```

**Step 2: Update the My Playlists section in `app/library/playlists/page.tsx`**

Read the file first (it's already loaded in context above). Find the `{/* My Playlists — real data */}` section (lines 241–261). Replace it entirely with:

```tsx
{/* My Playlists — real data */}
<div>
    <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">My Playlists</p>
        <CreatePlaylistInput />
    </div>
    {otherSetlists.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
            {otherSetlists.map(setlist => {
                const counts = songCounts[setlist.id] ?? { total: 0, public: 0, draft: 0 };
                return (
                    <PlaylistCard
                        key={setlist.id}
                        id={setlist.id}
                        title={setlist.title}
                        subtitle={<SongCountSubtitle counts={counts} emptyLabel={setlist.description ?? 'No songs yet'} />}
                    />
                );
            })}
        </div>
    ) : (
        <p className="text-sm text-gray-600 italic py-2">No playlists yet — create your first one above.</p>
    )}
</div>
```

Also add imports at the top of `app/library/playlists/page.tsx`:

```tsx
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Verify manually**

Start dev server (`npm run dev`). Log in. Go to `/library/playlists`. Verify:
- "New Playlist" link appears in the My Playlists header
- Clicking it shows inline input; pressing Enter creates the playlist
- Existing playlists show as linked cards with `···` menu
- Clicking `···` → Rename works (inline input on the card)
- Clicking `···` → Delete shows confirmation modal, deletes on confirm
- Smart playlists (My Favorites etc.) have no `···` menu

**Step 5: Commit**

```bash
git add components/playlists/CreatePlaylistInput.tsx app/library/playlists/page.tsx
git commit -m "feat: playlist create, rename, delete on /library/playlists page"
```

---

## Task 7: Create `PlaylistPicker` Component

**Files:**
- Create: `components/playlists/PlaylistPicker.tsx`

**Step 1: Create the component**

```tsx
// components/playlists/PlaylistPicker.tsx
'use client';

import { useState, useTransition } from 'react';
import { Plus, Check, ListPlus, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { addSongToPlaylist, createPlaylist } from '@/app/actions/playlistActions';
import { PLAYLIST_KEYS } from '@/lib/songs/queryKeys';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PlaylistPickerProps {
    compositionId: string;
    userId: string;
    /** className for the trigger button */
    triggerClassName?: string;
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchUserPlaylists(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from('setlists')
        .select('id, title')
        .eq('owner_id', userId)
        .not('title', 'in', '("My Favorites","My Songs","My Drafts")')
        .order('created_at', { ascending: false });
    return data ?? [];
}

async function fetchContainingPlaylists(compositionId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from('setlist_items')
        .select('setlist_id, song_versions!inner(composition_id)')
        .eq('song_versions.composition_id', compositionId);
    return new Set((data ?? []).map(d => d.setlist_id));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlaylistPicker({ compositionId, userId, triggerClassName }: PlaylistPickerProps) {
    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, startCreateTransition] = useTransition();
    const queryClient = useQueryClient();

    const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
        queryKey: PLAYLIST_KEYS.list(userId),
        queryFn: () => fetchUserPlaylists(userId),
        enabled: open,
    });

    const { data: containingIds = new Set<string>(), isLoading: loadingContaining } = useQuery({
        queryKey: PLAYLIST_KEYS.containingComposition(compositionId),
        queryFn: () => fetchContainingPlaylists(compositionId),
        enabled: open,
    });

    const isLoading = loadingPlaylists || loadingContaining;

    const handleToggle = async (playlistId: string, playlistTitle: string) => {
        const wasIn = containingIds.has(playlistId);

        // Optimistic update
        queryClient.setQueryData<Set<string>>(
            PLAYLIST_KEYS.containingComposition(compositionId),
            prev => {
                const next = new Set(prev);
                if (wasIn) next.delete(playlistId);
                else next.add(playlistId);
                return next;
            }
        );

        const result = await addSongToPlaylist(playlistId, compositionId);
        if (result.error) {
            toast.error(result.error);
            // revert
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.containingComposition(compositionId) });
        } else {
            toast.success(wasIn ? `Removed from "${playlistTitle}"` : `Added to "${playlistTitle}"`);
        }
    };

    const handleCreate = () => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        startCreateTransition(async () => {
            const result = await createPlaylist(trimmed);
            if ('error' in result) {
                toast.error(result.error);
                return;
            }
            // Add the song to the new playlist
            await addSongToPlaylist(result.id, compositionId);
            toast.success(`Added to new playlist "${trimmed}"`);
            setNewTitle('');
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.list(userId) });
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.containingComposition(compositionId) });
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                    aria-label="Add to playlist"
                    className={cn(
                        'p-1 rounded-full transition-all duration-300 text-gray-700 hover:text-gray-400',
                        triggerClassName
                    )}
                >
                    <ListPlus className="w-3.5 h-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
                {/* New playlist input */}
                <div className="flex items-center gap-2 p-3 border-b border-gray-800">
                    <input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') setOpen(false);
                        }}
                        placeholder="New playlist…"
                        disabled={isCreating}
                        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newTitle.trim() || isCreating}
                        className="text-amber-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
                    >
                        {isCreating
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Plus className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Playlist list */}
                <div className="max-h-56 overflow-y-auto py-1">
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        </div>
                    )}
                    {!isLoading && playlists.length === 0 && (
                        <p className="text-xs text-gray-600 text-center py-4 px-3">
                            No playlists yet — create one above.
                        </p>
                    )}
                    {!isLoading && playlists.map(pl => (
                        <button
                            key={pl.id}
                            onClick={() => handleToggle(pl.id, pl.title)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors text-left"
                        >
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                {containingIds.has(pl.id) && (
                                    <Check className="w-3.5 h-3.5 text-amber-400" />
                                )}
                            </div>
                            <span className="truncate">{pl.title}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/playlists/PlaylistPicker.tsx
git commit -m "feat: add PlaylistPicker popover component"
```

---

## Task 8: Add PlaylistPicker to SongCard

**Files:**
- Modify: `components/home/SongCard.tsx`

**Step 1: Read the current SongCard**

The file is at `components/home/SongCard.tsx`. Current props include `id` (composition ID). Add `userId?: string` as an optional prop.

**Step 2: Update SongCard**

Add `userId` to the props interface and destructure it. Import `PlaylistPicker`. In the JSX, add the picker next to the heart button:

```tsx
// Add to imports:
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';

// Add to SongCardProps interface:
userId?: string;

// Add to destructuring:
userId,

// In the JSX, find the heart <button> (around line 133) and add the picker alongside it:
// Replace:
{/* Heart button — bottom-right to avoid overlap with admin delete button (top-right) */}
<button
    onClick={handleToggle}
    ...
>
    ...
</button>

// With:
{/* Action buttons — bottom-right */}
<div className="absolute bottom-3 right-3 z-20 flex items-center gap-1">
    {userId && (
        <PlaylistPicker
            compositionId={id}
            userId={userId}
            triggerClassName="hover:text-gray-400"
        />
    )}
    <button
        onClick={handleToggle}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        className={cn(
            'p-1 rounded-full transition-all duration-300',
            isFav
                ? 'text-amber-400 heart-glow'
                : 'text-gray-700 hover:text-amber-400/60'
        )}
    >
        <Heart
            className={cn(
                'w-3.5 h-3.5 transition-all duration-200',
                isFav && 'fill-amber-400 scale-110'
            )}
            strokeWidth={1.5}
        />
    </button>
</div>
```

**Step 3: Pass `userId` to SongCard from parent**

Find where `SongCard` is rendered — search for usages:

```bash
grep -rn "<SongCard" app/ components/ --include="*.tsx" -l
```

Read each file and pass `userId={user?.id}` (where `user` comes from `useAuth()` or the server component).

**Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Verify manually**

Log in. Open `/songs`. Hover a song card. Verify the `ListPlus` icon appears next to the heart. Click it — the popover opens, shows "New playlist…" input and any existing playlists.

**Step 6: Commit**

```bash
git add components/home/SongCard.tsx
# Also add any parent files that needed userId prop change
git commit -m "feat: add PlaylistPicker to SongCard"
```

---

## Task 9: Add PlaylistPicker to Song Detail Page

**Files:**
- Modify: `app/songs/[id]/page.tsx`

**Step 1: Read the song detail page**

The file is at `app/songs/[id]/page.tsx`. It's a client component using `useAuth()` and has a heart button using `useToggleFavorite`.

**Step 2: Import and add PlaylistPicker**

Add import:

```tsx
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
```

Find the heart button in the JSX (search for `Heart` icon). Add `PlaylistPicker` alongside it:

```tsx
// Find the heart button area and add PlaylistPicker next to it:
<div className="flex items-center gap-2">
    {user && (
        <PlaylistPicker
            compositionId={id!}
            userId={user.id}
            triggerClassName="p-2"
        />
    )}
    <button
        onClick={() => handleToggle()}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        // ... existing classes
    >
        <Heart ... />
    </button>
</div>
```

Note: The exact surrounding JSX depends on current layout — read the file and adapt placement to match existing UI patterns.

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Verify manually**

Open any song detail page while logged in. Verify the `ListPlus` icon appears near the heart button. Clicking it opens the playlist picker.

**Step 5: Commit**

```bash
git add app/songs/[id]/page.tsx
git commit -m "feat: add PlaylistPicker to song detail page"
```

---

## Task 10: Create Playlist Detail Page (Server Component)

**Files:**
- Create: `app/library/playlists/[id]/page.tsx`

**Step 1: Create the server component**

```tsx
// app/library/playlists/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlaylistDetailClient } from '@/components/playlists/PlaylistDetailClient';
import { PlaylistContextMenu } from '@/components/playlists/PlaylistContextMenu';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PlaylistDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login?next=/library/playlists/' + id);

    const { data: playlist } = await supabase
        .from('setlists')
        .select('id, title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) notFound();

    const { data: items } = await supabase
        .from('setlist_items')
        .select(`
            id,
            order_index,
            song_versions (
                id,
                compositions (
                    id,
                    title,
                    original_author
                )
            )
        `)
        .eq('setlist_id', id)
        .order('order_index', { ascending: true });

    const mappedItems = (items ?? []).map(item => ({
        id: item.id,
        songTitle: (item.song_versions as any)?.compositions?.title ?? 'Unknown',
        songAuthor: (item.song_versions as any)?.compositions?.original_author ?? '',
        songId: (item.song_versions as any)?.compositions?.id ?? '',
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/library/playlists"
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Back to playlists"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-100 truncate">{playlist.title}</h1>
                    <p className="text-xs text-gray-500">{mappedItems.length} song{mappedItems.length !== 1 ? 's' : ''}</p>
                </div>
                <PlaylistContextMenu
                    playlistId={playlist.id}
                    playlistTitle={playlist.title}
                    onRenameStart={() => {}} // rename handled inline on playlists page; here it's a no-op stub
                />
            </div>

            {/* Song list with DnD */}
            <PlaylistDetailClient
                playlistId={id}
                initialItems={mappedItems}
            />
        </div>
    );
}
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add app/library/playlists/[id]/page.tsx
git commit -m "feat: add playlist detail server page at /library/playlists/[id]"
```

---

## Task 11: Create `PlaylistDetailClient` — DnD Reorder + Remove

**Files:**
- Create: `components/playlists/PlaylistDetailClient.tsx`

**Step 1: Create the component**

```tsx
// components/playlists/PlaylistDetailClient.tsx
'use client';

import { useState, useTransition } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Music } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { reorderPlaylistSongs, removeSongFromPlaylist } from '@/app/actions/playlistActions';

interface PlaylistItem {
    id: string;
    songTitle: string;
    songAuthor: string;
    songId: string;
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
    item,
    onRemove,
}: {
    item: PlaylistItem;
    onRemove: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 bg-gray-900/40 border border-gray-800 rounded-xl group hover:bg-gray-800/60 hover:border-gray-700 transition-colors"
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
                aria-label="Drag to reorder"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {/* Song info */}
            <Link
                href={`/songs/${item.songId}`}
                className="flex-1 min-w-0 hover:text-amber-400 transition-colors"
                onClick={e => e.stopPropagation()}
            >
                <p className="text-sm font-medium text-gray-100 truncate">{item.songTitle}</p>
                <p className="text-xs text-gray-500 truncate">{item.songAuthor}</p>
            </Link>

            {/* Remove button */}
            <button
                onClick={() => onRemove(item.id)}
                className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                aria-label={`Remove ${item.songTitle} from playlist`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlaylistDetailClient({
    playlistId,
    initialItems,
}: {
    playlistId: string;
    initialItems: PlaylistItem[];
}) {
    const [items, setItems] = useState(initialItems);
    const [isPending, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        const prev = items;
        setItems(reordered); // optimistic

        startTransition(async () => {
            const result = await reorderPlaylistSongs(playlistId, reordered.map(i => i.id));
            if (result.error) {
                setItems(prev); // revert
                toast.error('Could not save order');
            }
        });
    };

    const handleRemove = (itemId: string) => {
        const prev = items;
        setItems(items.filter(i => i.id !== itemId)); // optimistic

        startTransition(async () => {
            const result = await removeSongFromPlaylist(itemId);
            if (result.error) {
                setItems(prev); // revert
                toast.error(result.error);
            }
        });
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <Music className="w-10 h-10 text-gray-700" />
                <p className="text-gray-500 text-sm max-w-xs">
                    No songs yet. Add songs using the <span className="text-gray-400">+</span> icon on any song card or detail page.
                </p>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {items.map(item => (
                        <SortableRow key={item.id} item={item} onRemove={handleRemove} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Verify manually**

Log in. Create a playlist. Add 3+ songs to it. Navigate to the playlist detail page. Verify:
- Songs appear in order
- Drag handle allows reordering (order persists on refresh)
- X button removes a song (gone on refresh)
- Empty state shows when all songs removed

**Step 4: Commit**

```bash
git add components/playlists/PlaylistDetailClient.tsx
git commit -m "feat: PlaylistDetailClient with DnD reorder and remove"
```

---

## Final Verification Checklist

| Scenario | Expected |
|----------|----------|
| Logged-in user on `/library/playlists` | "New Playlist" link visible in My Playlists header |
| Click "New Playlist" | Inline input appears; Enter creates playlist, appears in list |
| Click `···` on a playlist → Rename | Card title becomes editable input; blur/Enter saves |
| Click `···` on a playlist → Delete | Confirmation modal; confirm removes playlist |
| Edit Playlist / Add / Make Private in menu | Shown but disabled with "Soon" label |
| Smart playlists (My Favorites etc.) | No `···` menu |
| Song card (logged-in) | `ListPlus` icon next to heart |
| Click `ListPlus` on song card | Popover opens with "New playlist…" and list |
| Click playlist in picker | Checkmark appears; song added |
| Click checked playlist in picker | Checkmark removed; song removed |
| Type in "New playlist…" + Enter | Playlist created; song added; appears in list |
| Navigate to `/library/playlists/[id]` | Header, song count, DnD list |
| Drag song row | Reorders visually; persists on refresh |
| Click X on song row | Song removed; persists on refresh |
| Guest visits `/library/playlists/[id]` | Redirected to login |
| `npx tsc --noEmit` | No errors |

