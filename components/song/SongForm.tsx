'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { parseChordPro, hasChords } from '@/lib/chordProParsing';
import { useAuth } from '@/hooks/useAuth';
import CategorySelector from './CategorySelector';
import ChordProEditor from './ChordProEditor';

import { ArtistTagInput } from './ArtistTagInput';
import { parseArtists, formatArtists, ensureArtistCategoryIds } from '@/lib/songs/artistUtils';

type SongFormData = {
    title: string;
    author: string;
    content: string;
    categoryIds: string[];
    key?: string;
    capo?: string;
    tuning?: string;
    youtubeLink: string;
    spotifyLink: string;
    soundcloudLink: string;
    melodyNotation: string;
    isPublic: boolean;
};

interface SongFormProps {
    mode: 'create' | 'edit';
    initialData?: SongFormData;
    songId?: string;
    versionId?: string; // For updating the specific version
}

const SongForm = ({ mode, initialData, songId, versionId }: SongFormProps) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SongFormData>({
        defaultValues: {
            ...initialData,
            categoryIds: initialData?.categoryIds || [],
            key: initialData?.key || '',
            capo: initialData?.capo ? String(initialData.capo) : '',
            tuning: initialData?.tuning || '',
            youtubeLink: initialData?.youtubeLink || '',
            spotifyLink: initialData?.spotifyLink || '',
            soundcloudLink: initialData?.soundcloudLink || '',
            melodyNotation: initialData?.melodyNotation || '',
            isPublic: initialData?.isPublic ?? true,
        }
    });

    const { user } = useAuth();

    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    // Auto-expand metadata if fields are populated (Edit Mode or after Parsing)
    const hasMetadata = !!(initialData?.key || initialData?.capo || (initialData?.tuning && initialData.tuning !== 'Standard'));
    const [isMetadataExpanded, setIsMetadataExpanded] = useState(hasMetadata);

    // Auto-expand tags if populated
    const hasTags = !!(initialData?.categoryIds && initialData.categoryIds.length > 0);
    const [isTagsExpanded, setIsTagsExpanded] = useState(hasTags);

    // Update expansion when parsing finds metadata
    const expandMetadata = (foundData: boolean) => {
        if (foundData) setIsMetadataExpanded(true);
    };

    // Watch fields for UI updates
    const currentCategoryIds = watch('categoryIds') || [];


    // Persistence Logic (Create Mode)
    useEffect(() => {
        if (mode !== 'create') return;
        const STORAGE_KEY = 'song-form-draft';

        // Restore on mount
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Check if draft has meaningful data before restoring (optional, but good UX)
                const hasData = Object.values(parsed).some(v => Array.isArray(v) ? v.length > 0 : !!v);

                if (hasData) {
                    // Update form values
                    Object.keys(parsed).forEach((key) => {
                        setValue(key as keyof SongFormData, parsed[key]);
                    });

                    // Restore UI states
                    if (parsed.key || parsed.capo || (parsed.tuning && parsed.tuning !== 'Standard')) {
                        setIsMetadataExpanded(true);
                    }
                    if (parsed.categoryIds && parsed.categoryIds.length > 0) {
                        setIsTagsExpanded(true);
                    }
                }
            } catch (e) {
                console.error("Failed to restore draft", e);
            }
        }

        // Save on change
        const subscription = watch((value) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [mode, setValue, watch]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const { title, author, key, capo, cleanContent } = parseChordPro(text);
            if (title) setValue('title', title);
            if (author) setValue('author', author);
            if (key) setValue('key', key);
            if (key) setValue('key', key);
            if (capo) setValue('capo', capo);

            if (key || capo) expandMetadata(true);
            setValue('content', cleanContent);

            // Auto-collapse after success
            setShowUpload(false);
        } catch (err) {
            console.error('Failed to read file', err);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text');

        // Only intercept if it's a multi-line paste or has ChordPro metadata tags
        const hasMeta = /{(?:title|t|author|a|artist):/i.test(text);
        const isMultiLine = text.trim().split('\n').length > 1;

        if (!hasMeta && !isMultiLine) return; // Let single-line pastes go through normally

        e.preventDefault();

        const { title, author, key, capo, cleanContent } = parseChordPro(text);

        // Apply metadata only if found in the pasted block
        // (don't clobber existing form values if nothing was detected)
        if (title) setValue('title', title);
        if (author) setValue('author', author);
        if (key) setValue('key', key);
        if (capo) setValue('capo', capo);
        if (key || capo) expandMetadata(true);

        // Save textarea ref NOW — e.currentTarget becomes null after async
        const textarea = e.currentTarget;
        const existingContent = watch('content') || '';
        const selStart = textarea.selectionStart ?? existingContent.length;
        const selEnd = textarea.selectionEnd ?? existingContent.length;

        let newContent: string;
        let cursorPos: number;

        if (!existingContent.trim()) {
            // Empty field: just set directly, cursor at end of pasted content
            newContent = cleanContent;
            cursorPos = cleanContent.length;
        } else {
            // Splice at cursor position
            const before = existingContent.slice(0, selStart);
            const after = existingContent.slice(selEnd);
            const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
            const needsTrailingNewline = after.length > 0 && !after.startsWith('\n');

            newContent =
                before +
                (needsLeadingNewline ? '\n' : '') +
                cleanContent +
                (needsTrailingNewline ? '\n' : '') +
                after;

            // Cursor lands at the end of the inserted block
            cursorPos = selStart + (needsLeadingNewline ? 1 : 0) + cleanContent.length;
        }

        // Use flushSync to force a synchronous re-render, then immediately
        // restore cursor — avoids rAF race where a keystroke between setValue
        // and the async callback moves the cursor to the wrong position
        flushSync(() => {
            setValue('content', newContent);
        });
        textarea.setSelectionRange(cursorPos, cursorPos);
    };







    const mutation = useMutation({
        mutationFn: async (data: SongFormData) => {
            if (mode === 'create') {
                const supabase = createClient();
                const { data: composition, error: compError } = await supabase
                    .from('compositions')
                    .insert({
                        title: data.title,
                        original_author: data.author,
                        owner_id: user?.id,
                        is_public: data.isPublic,
                        has_chords: hasChords(data.content),
                        has_melody: !!(data.youtubeLink || data.spotifyLink || data.soundcloudLink || data.melodyNotation)
                    })
                    .select()
                    .single();

                if (compError) throw compError;

                // 2. Insert Version
                const { error: versionError } = await supabase
                    .from('song_versions')
                    .insert({
                        composition_id: composition.id,
                        version_name: 'Standard',
                        content_chordpro: data.content,
                        key: data.key,
                        capo: data.capo ? parseInt(data.capo) : 0,
                        tuning: data.tuning,
                        youtube_url: data.youtubeLink,
                        spotify_url: data.spotifyLink,
                        soundcloud_url: data.soundcloudLink,
                        melody_notation: data.melodyNotation,
                        contributor_id: user?.id
                    });

                if (versionError) throw versionError;

                // 3. Insert Categories & Artist Categories
                const artistCatIds = await ensureArtistCategoryIds(supabase, parseArtists(data.author));
                const allCategoryIds = Array.from(new Set([...(data.categoryIds || []), ...artistCatIds]));

                if (allCategoryIds.length > 0) {
                    const categoryInserts = allCategoryIds.map(catId => ({
                        song_id: composition.id,
                        category_id: catId
                    }));

                    const { error: catError } = await supabase
                        .from('song_category_map')
                        .insert(categoryInserts);

                    if (catError) throw catError;
                }


                return composition.id;
            } else {
                const supabase = createClient();
                if (!songId || !versionId) throw new Error('Missing ID for update');

                const { error: compError } = await supabase
                    .from('compositions')
                    .update({
                        title: data.title,
                        original_author: data.author,
                        is_public: data.isPublic,
                        has_chords: hasChords(data.content),
                        has_melody: !!(data.youtubeLink || data.spotifyLink || data.soundcloudLink || data.melodyNotation),
                    })
                    .eq('id', songId);

                if (compError) throw compError;

                const { error: versionError } = await supabase
                    .from('song_versions')
                    .update({
                        content_chordpro: data.content,
                        key: data.key,
                        capo: data.capo ? parseInt(data.capo) : 0,
                        tuning: data.tuning,
                        youtube_url: data.youtubeLink,
                        spotify_url: data.spotifyLink,
                        soundcloud_url: data.soundcloudLink,
                        melody_notation: data.melodyNotation,
                    })
                    .eq('id', versionId);

                if (versionError) throw versionError;

                // 3. Update Categories & Artist Categories
                const { error: deleteCatError } = await supabase
                    .from('song_category_map')
                    .delete()
                    .eq('song_id', songId);

                if (deleteCatError) throw deleteCatError;

                const artistCatIds = await ensureArtistCategoryIds(supabase, parseArtists(data.author));
                const allCategoryIds = Array.from(new Set([...(data.categoryIds || []), ...artistCatIds]));

                if (allCategoryIds.length > 0) {
                    const categoryInserts = allCategoryIds.map(catId => ({
                        song_id: songId,
                        category_id: catId
                    }));

                    const { error: insertCatError } = await supabase
                        .from('song_category_map')
                        .insert(categoryInserts);

                    if (insertCatError) throw insertCatError;
                }

                return songId;
            }
        },
        onSuccess: (id) => {
            if (mode === 'create') {
                localStorage.removeItem('song-form-draft');
            }
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.all() });
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.detail(id) });
            // Bust global filter counts (chords/melody/mine may have changed)
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.globalFilterCounts() });
            const returnTo = mode === 'create' ? (searchParams.get('next') || '/') : `/songs/${id}`;
            router.refresh();
            router.push(returnTo);
        },
        onError: (error: Error) => {
            setServerError(error.message);
        }
    });

    const handleFormSubmit = (data: SongFormData) => {
        if (!user) {
            router.push('/auth/login?message=Please log in to save songs');
            return;
        }
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl w-full max-w-2xl mx-auto shadow-xl min-w-0">
            <div className="space-y-4">
                {/* File Upload Toggle Section */}
                {/* File Upload Section */}
                {showUpload && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 relative">
                        {/* Upload UI Code */}
                        <button
                            type="button"
                            onClick={() => setShowUpload(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <div className="flex items-start gap-3 mb-4">
                            <span className="material-symbols-outlined text-blue-400 mt-0.5">info</span>
                            <p className="text-blue-100 text-xs leading-relaxed flex-1">
                                Upload a <span className="bg-blue-500/30 px-1 rounded font-mono">.cho</span> or <span className="bg-blue-500/30 px-1 rounded font-mono">.txt</span> file. Title and author will be detected automatically.
                            </p>
                        </div>
                        <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-gray-100/50 dark:bg-gray-800/50 group">
                            <input
                                type="file"
                                accept=".cho,.txt,.pro,.chordpro"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <div className="bg-gray-200/50 dark:bg-gray-700/50 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 p-4 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">cloud_upload</span>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-900 dark:text-white font-semibold group-hover:text-indigo-300">Tap to select file</p>
                                <p className="text-gray-500 text-xs mt-1">ChordPro files only</p>
                            </div>
                        </label>
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="cursor-pointer flex min-w-[100px] items-center justify-center rounded-lg h-11 px-6 border border-slate-300 dark:border-[#674d32] text-slate-600 dark:text-[#c9ad92] text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#332619]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-11 px-8 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 active:bg-primary/90"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                )}


                {/* Upload file toggle (no "Song Details" heading) */}
                {!showUpload && (
                    <div className="flex justify-end pb-2">
                        <button
                            type="button"
                            onClick={() => setShowUpload(true)}
                            className="text-indigo-400 text-xs font-semibold flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-sm">attachment</span>
                            Or upload a file (.cho, .txt)
                        </button>
                    </div>
                )}

                {/* 1. Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 p-1">
                        Song Title
                    </label>
                    <input
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        className="w-full bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-[#a19eb7]/50"
                        placeholder="e.g. Grandmother Earth"
                    />
                    {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
                </div>

                {/* 2. Author / Artist (Multi-Artist Pill Input) */}
                <div className="space-y-2">
                    <label htmlFor="author" className="block text-sm font-medium text-gray-600 dark:text-gray-300 p-1">
                        Author / Artist(s) <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <ArtistTagInput
                        selectedArtists={parseArtists(watch('author') || '')}
                        onChange={(artists) => setValue('author', formatArtists(artists), { shouldDirty: true })}
                        placeholder="e.g. Traditional or Artist Name"
                    />
                </div>

                {/* 3. Lyrics & Chords (moved up) */}
                <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-end pb-2">
                        <div>
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Lyrics & chords</h3>
                            <p className="text-[#a19eb7] text-xs font-normal mt-1">Use brackets [] for chords: eg. <span className="font-mono text-primary">[Dm]</span>Abre tus alas <span className="font-mono text-primary">[A7]</span>pajaro volar <span className="font-mono text-primary">[Dm]</span></p>
                        </div>
                        <span className="material-symbols-outlined text-[#a19eb7] cursor-pointer">help_outline</span>
                    </div>

                    <div className="w-full min-w-0 max-w-full overflow-hidden bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all h-[400px]">
                        <ChordProEditor
                            {...register('content', { required: 'Content is required' })}
                            value={watch('content') || ''}
                            onPaste={handlePaste}
                            className="w-full h-full rounded-lg"
                            placeholder="[Dm]Abre tus alas [A7]pajaro volar [Dm]"
                        />
                    </div>
                    {errors.content && <p className="text-red-400 text-sm">{errors.content.message}</p>}
                </div>

                {/* 4. Key / Capo / Tuning (collapsible, simplified) */}
                <details className="group" open={isMetadataExpanded} onToggle={(e) => setIsMetadataExpanded(e.currentTarget.open)}>
                    <summary className="w-full flex items-center justify-between py-3 cursor-pointer select-none list-none">
                        <h3 className="text-gray-400 font-semibold text-sm">Key, Capo & Tuning</h3>
                        <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3">
                        {/* Key */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-400">Key</label>
                            <div className="relative">
                                <select
                                    {...register('key')}
                                    className="w-full bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="">(Select Key)</option>
                                    {['C', 'Cm', 'C#', 'Db', 'D', 'Dm', 'Eb', 'E', 'Em', 'F', 'Fm', 'F#', 'Gb', 'G', 'Gm', 'G#', 'Ab', 'A', 'Am', 'Bb', 'B', 'Bm'].map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-1 top-2 text-gray-500 pointer-events-none text-base">arrow_drop_down</span>
                            </div>
                        </div>

                        {/* Capo */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-400">Capo</label>
                            <div className="relative">
                                <select
                                    {...register('capo')}
                                    className="w-full bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="">(No Capo)</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                                        <option key={i} value={i}>{i === 1 ? '1st Fret' : i === 2 ? '2nd Fret' : i === 3 ? '3rd Fret' : `${i}th Fret`}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-1 top-2 text-gray-500 pointer-events-none text-base">arrow_drop_down</span>
                            </div>
                        </div>

                        {/* Tuning */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-400">Tuning</label>
                            <div className="relative">
                                <select
                                    {...register('tuning')}
                                    className="w-full bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="">(Select Tuning)</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Drop D">Drop D</option>
                                    <option value="Open G">Open G</option>
                                    <option value="DADGAD">DADGAD</option>
                                    <option value="Open D">Open D</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-1 top-2 text-gray-500 pointer-events-none text-base">arrow_drop_down</span>
                            </div>
                        </div>
                    </div>
                </details>

                {/* 5. Categories / Tags (collapsible, simplified) */}
                <details className="group" open={isTagsExpanded} onToggle={(e) => setIsTagsExpanded(e.currentTarget.open)}>
                    <summary className="w-full flex items-center justify-between py-3 cursor-pointer select-none list-none">
                        <h3 className="text-gray-400 font-semibold text-sm">Categories / Tags</h3>
                        <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="pb-3">
                        <CategorySelector
                            selectedIds={currentCategoryIds}
                            onChange={(ids) => setValue('categoryIds', ids)}
                        />
                    </div>
                </details>

                {/* 6. Links (collapsible) */}
                <details className="group">
                    <summary className="w-full flex items-center justify-between py-3 cursor-pointer select-none list-none">
                        <h3 className="text-gray-400 font-semibold text-sm">Links (YouTube, Spotify, Soundcloud)</h3>
                        <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="space-y-3 pb-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-[#ff0000] text-xl">play_circle</span>
                            </div>
                            <input
                                {...register('youtubeLink')}
                                className="w-full pl-11 bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg h-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-[#a19eb7]/50 text-sm"
                                placeholder="Paste YouTube link"
                            />
                        </div>

                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-[#1db954] text-xl">radio</span>
                            </div>
                            <input
                                {...register('spotifyLink')}
                                className="w-full pl-11 bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg h-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-[#a19eb7]/50 text-sm"
                                placeholder="Paste Spotify link"
                            />
                        </div>

                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff5500]" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
                                </svg>
                            </div>
                            <input
                                {...register('soundcloudLink')}
                                className="w-full pl-11 bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg h-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-[#a19eb7]/50 text-sm"
                                placeholder="Paste Soundcloud link"
                            />
                        </div>
                    </div>
                </details>

                {/* 7. Melody Notation — Coming Soon */}
                <details className="group opacity-60">
                    <summary className="w-full flex items-center justify-between py-3 cursor-pointer select-none list-none">
                        <div className="flex items-center gap-2">
                            <h3 className="text-gray-400 font-semibold text-sm">Melody Notation</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Coming Soon</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="py-3">
                        <p className="text-gray-500 text-xs">ABC notation support is under development.</p>
                    </div>
                </details>
            </div>

            {serverError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm">
                    Error: {serverError}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                    type="submit"
                    onClick={() => setValue('isPublic', false)}
                    disabled={mutation.isPending}
                    className="flex-1 bg-transparent border-2 border-gray-300 dark:border-[#3f3d52] text-gray-500 dark:text-[#a19eb7] hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 font-bold py-3 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {mutation.isPending && watch('isPublic') === false ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save as Draft'
                    )}
                </button>
                <button
                    type="submit"
                    onClick={() => setValue('isPublic', true)}
                    disabled={mutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {mutation.isPending && watch('isPublic') === true ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        'Publish Song'
                    )}
                </button>
            </div>
        </form>
    );
}

export default SongForm;
