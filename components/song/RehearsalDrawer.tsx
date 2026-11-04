"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Trash2, Pencil, Play, Pause, Lock, RotateCcw, RotateCw, GripVertical, Download, ChevronUp, ChevronDown, Check, Share2, Globe, Users, Mic, CheckCircle2, Clock, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import AudioRecorder from "./AudioRecorder";
import { useSongRecordings } from "@/hooks/useSongRecordings";
import { getUserRecordings, deleteUserRecording, renameUserRecording, reorderUserRecordings, unpublishRecording, type UserRecording } from "@/lib/actions/rehearsal";
import { getYouTubeEmbedUrl, getSpotifyEmbedUrl } from "./MediaEmbeds";
import { useAuth } from "@/hooks/useAuth";
import { useAudio } from "./AudioProvider";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/context/LocaleContext";
import RecordingShareModal from "./RecordingShareModal";
import RecordingPublishModal from "./RecordingPublishModal";
import RecordingAttributionModal from "./RecordingAttributionModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRecordingItem({
  rec,
  activePlaybackId,
  isRecordingPlaying,
  deletingId,
  downloadingId,
  handleTogglePlay,
  handleDelete,
  handleDownload,
  handleRename,
  handleShare,
  handlePublish,
  handleAttribution,
  formatDate,
  isCustomSort,
}: {
  rec: UserRecording;
  activePlaybackId: string | null;
  isRecordingPlaying: boolean;
  deletingId: string | null;
  downloadingId: string | null;
  handleTogglePlay: (id: string, url: string | undefined) => void;
  handleDelete: (id: string, path: string) => void;
  handleDownload: (recording: UserRecording) => void;
  handleRename: (id: string, newName: string) => void;
  handleShare?: (recording: UserRecording) => void;
  handlePublish?: (recording: UserRecording) => void;
  handleAttribution?: (recording: UserRecording) => void;
  formatDate: (date: string) => string;
  isCustomSort: boolean;
}) {
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(rec.recording_name);
  const renameRequested = useRef(false);

  const isOwner = rec.is_owner !== false;
  const isShared = rec.is_shared === true;

  const handleSaveRename = () => {
    if (editValue.trim() && editValue !== rec.recording_name) {
      handleRename(rec.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") { setEditValue(rec.recording_name); setIsEditing(false); }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const isPlaying = activePlaybackId === rec.id && isRecordingPlaying;
  const shareCount = rec.shared_with?.length ?? 0;
  const singerLabel = rec.singer_profile?.full_name || rec.singer_name;
  const duration = rec.duration_seconds
    ? `${Math.floor(rec.duration_seconds / 60)}:${(rec.duration_seconds % 60).toString().padStart(2, "0")}`
    : null;
  const busy = deletingId === rec.id || downloadingId === rec.id;
  const menuItemClass = "gap-2 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors group"
    >
      {/* Drag handle: only in custom sort, revealed on hover on pointer devices */}
      {isCustomSort && isOwner && (
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none shrink-0 -ml-1 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          aria-label={t('rehearsal.recording.drag.ariaLabel')}
          title={t('rehearsal.recording.drag.ariaLabel')}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => handleTogglePlay(rec.id, rec.audioUrl)}
        disabled={!rec.audioUrl}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
          !rec.audioUrl
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 opacity-50 cursor-not-allowed"
            : isPlaying
            ? "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95"
            : "bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 active:scale-95"
        }`}
        title={!rec.audioUrl ? t('rehearsal.recording.missingTitle') : isPlaying ? t('rehearsal.recording.pause') : t('rehearsal.recording.play')}
        aria-label={!rec.audioUrl ? t('rehearsal.recording.missingTitle') : isPlaying ? t('rehearsal.recording.pause') : t('rehearsal.recording.play')}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-px" />}
      </button>

      <div className="flex-1 min-w-0 text-left">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            aria-label={t('rehearsal.recording.edit.ariaLabel')}
            className="w-full text-sm font-semibold bg-white dark:bg-gray-900 border border-indigo-500 rounded px-2 py-0.5 outline-none text-gray-900 dark:text-white"
          />
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-sm font-semibold truncate ${!rec.audioUrl ? "text-red-500/80 dark:text-red-400/80" : "text-gray-900 dark:text-white"}`}
              onDoubleClick={() => isOwner && setIsEditing(true)}
            >
              {rec.recording_name}
            </h4>
            {/* Visibility: private is the default and gets no marker */}
            {rec.is_public ? (
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label={t('recording.publish.badge')}>
                <title>{t('recording.publish.badge')}</title>
              </Globe>
            ) : isShared ? (
              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-label={t('recording.sharing.badge')}>
                <title>{t('recording.sharing.badge')}</title>
              </Users>
            ) : shareCount > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-indigo-500 shrink-0" title={`${t('recording.sharing.sharedWithTitle')} (${shareCount})`}>
                <Users className="w-3.5 h-3.5" aria-hidden />
                {shareCount}
              </span>
            ) : null}
            {!rec.audioUrl && (
              <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded shrink-0">
                {t('rehearsal.recording.missingBadge')}
              </span>
            )}
          </div>
        )}

        {/* One meta line: date · duration · singer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 min-w-0">
          <span className="shrink-0">{formatDate(rec.created_at)}</span>
          {duration && <><span aria-hidden className="opacity-50">·</span><span className="shrink-0 tabular-nums">{duration}</span></>}
          {singerLabel && (
            <>
              <span aria-hidden className="opacity-50">·</span>
              {rec.singer_profile_id && rec.singer_profile ? (
                <Link
                  href={`/users/${rec.singer_profile_id}`}
                  className="inline-flex items-center gap-1 min-w-0 text-indigo-600 dark:text-indigo-400 hover:underline"
                  title={rec.singer_profile.is_musician ? t('recording.attribution.badgeVerified') : undefined}
                >
                  <Mic className="w-3 h-3 shrink-0" aria-hidden />
                  <span className="truncate">{singerLabel}</span>
                  {rec.singer_profile.is_musician && <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" aria-label={t('recording.attribution.badgeVerified')} />}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 min-w-0" title={t('recording.attribution.badgePending')}>
                  <Mic className="w-3 h-3 shrink-0" aria-hidden />
                  <span className="truncate">{singerLabel}</span>
                  <Clock className="w-3 h-3 shrink-0 opacity-60" aria-label={t('recording.attribution.badgePending')} />
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Owner actions live in one menu; recipients only stream (DRM-lite) */}
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors shrink-0"
              aria-label={t('common.moreActions')}
              title={t('common.moreActions')}
            >
              {busy ? (
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            onCloseAutoFocus={(e) => {
              // Keep focus in the rename input instead of returning it to the trigger
              if (renameRequested.current) {
                e.preventDefault();
                renameRequested.current = false;
                setIsEditing(true);
              }
            }}
          >
            <DropdownMenuItem className={menuItemClass} onSelect={() => handleShare?.(rec)}>
              <Share2 className="w-4 h-4" />
              {t('recording.sharing.button')}
              {shareCount > 0 && <span className="ml-auto text-xs text-gray-500">{shareCount}</span>}
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onSelect={() => handlePublish?.(rec)}>
              {rec.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {rec.is_public ? t('recording.publish.makePrivate') : t('recording.publish.makePublic')}
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onSelect={() => handleAttribution?.(rec)}>
              <Mic className="w-4 h-4" />
              {t('recording.attribution.button')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
            <DropdownMenuItem className={menuItemClass} onSelect={() => { renameRequested.current = true; }}>
              <Pencil className="w-4 h-4" />
              {t('rehearsal.recording.edit.ariaLabel')}
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} disabled={!rec.audioUrl} onSelect={() => handleDownload(rec)}>
              <Download className="w-4 h-4" />
              {t('rehearsal.recording.download.ariaLabel')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
            <DropdownMenuItem
              className="gap-2 text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
              onSelect={() => handleDelete(rec.id, rec.storage_path)}
            >
              <Trash2 className="w-4 h-4" />
              {t('rehearsal.recording.delete.ariaLabel')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface RehearsalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  songVersionId: string;
  songTitle: string;
  songAuthor: string;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
  soundcloudUrl?: string | null;
  onPlayStateChange?: (isPlaying: boolean) => void;
  requestedTab?: "recorder" | "media" | "auto";
  isSongPublic?: boolean;
  isSongOwner?: boolean;
  onMakeSongPublic?: () => Promise<boolean>;
}

export default function RehearsalDrawer({
  isOpen,
  onClose,
  onOpen,
  songVersionId,
  songTitle,
  songAuthor,
  youtubeUrl,
  spotifyUrl,
  soundcloudUrl,
  onPlayStateChange,
  requestedTab = "auto",
  isSongPublic = true,
  isSongOwner = false,
  onMakeSongPublic,
}: RehearsalDrawerProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recorder" | "media">("media");
  const [selectedMedia, setSelectedMedia] = useState<"youtube" | "spotify" | "soundcloud" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserRecording | null>(null);
  const [shareRecording, setShareRecording] = useState<UserRecording | null>(null);
  const [privateSongPromptRecording, setPrivateSongPromptRecording] = useState<UserRecording | null>(null);
  const [isPublishingSong, setIsPublishingSong] = useState(false);
  const [publishRecording, setPublishRecording] = useState<UserRecording | null>(null);
  const [attributionRecording, setAttributionRecording] = useState<UserRecording | null>(null);
  const isAdmin = user?.role === 'admin';
  const { activePlaybackId, activeRecording, audioElements, isRecordingPlaying, recordingCurrentTime, recordingDuration, handleTogglePlay: contextHandleTogglePlay, pauseActiveRecording, stopActiveRecording, seekActiveRecording, seekRelativeActiveRecording, clearAudioElements } = useAudio();


  // Refs for media iframe elements
  const youtubeRef = React.useRef<HTMLIFrameElement>(null);
  const soundcloudRef = React.useRef<HTMLIFrameElement>(null);

  // Staging media control states
  const [playingSource, setPlayingSource] = useState<"youtube" | "soundcloud" | "spotify" | null>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(1);
  const [activeDomain, setActiveDomain] = useState<'recording' | 'media' | null>(null);

  const hasMedia = !!(youtubeUrl || spotifyUrl || soundcloudUrl);

  // Notify parent of play state change
  useEffect(() => {
    const isPlaying = isMediaPlaying || (activePlaybackId !== null && isRecordingPlaying);
    onPlayStateChange?.(isPlaying);
  }, [isMediaPlaying, activePlaybackId, isRecordingPlaying, onPlayStateChange]);

  // Auto-set playingSource when selectedMedia changes (only if it is controllable, and don't pause the others!)
  useEffect(() => {
    if (selectedMedia && selectedMedia !== "spotify" && !playingSource) {
      // Just pre-initialize playingSource if nothing has played yet
      setPlayingSource(selectedMedia);
    }
  }, [selectedMedia, playingSource]);

  const bindSoundCloudEvents = () => {
    if (soundcloudRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        return;
      }
      soundcloudRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"play"}', '*');
      soundcloudRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"pause"}', '*');
      soundcloudRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"playProgress"}', '*');
    }
  };

  useEffect(() => {
    if (selectedMedia === "soundcloud") {
      bindSoundCloudEvents();
    }
  }, [selectedMedia]);

  const bindYouTubeEvents = () => {
    if (youtubeRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        return;
      }
      youtubeRef.current.contentWindow.postMessage('{"event":"listening"}', '*');
      youtubeRef.current.contentWindow.postMessage('{"event":"command","func":"addEventListener","args":["onStateChange"]}', '*');
    }
  };

  useEffect(() => {
    if (selectedMedia === "youtube") {
      bindYouTubeEvents();
    }
  }, [selectedMedia]);

  // Set default active media source and tab when props change or user changes
  useEffect(() => {
    if (youtubeUrl) setSelectedMedia("youtube");
    else if (soundcloudUrl) setSelectedMedia("soundcloud");
    else if (spotifyUrl) setSelectedMedia("spotify");
    else setSelectedMedia(null);
  }, [youtubeUrl, soundcloudUrl, spotifyUrl, user]);

  // Only set the tab when the drawer opens or when an explicit tab is requested.
  // Do NOT react to isMediaPlaying / activePlaybackId changes — those are play-state
  // updates that must never override the tab the user is currently looking at.
  const prevIsOpen = React.useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpen.current;
    prevIsOpen.current = isOpen;

    if (isOpen && (justOpened || requestedTab !== "auto")) {
      if (requestedTab !== "auto") {
        setActiveTab(requestedTab);
      } else {
        // Contextual default only on first open
        if (activePlaybackId) setActiveTab("recorder");
        else if (isMediaPlaying) setActiveTab("media");
        else if (youtubeUrl || spotifyUrl || soundcloudUrl) setActiveTab("media");
        else setActiveTab("recorder");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, requestedTab]);

  const { data: fetchedRecordings, isLoading } = useSongRecordings(songVersionId);
  const [recordings, setRecordings] = useState<UserRecording[]>([]);
  useEffect(() => {
    if (fetchedRecordings) {
      setRecordings(fetchedRecordings);
    }
  }, [fetchedRecordings]);

  const hasAnyAudioSource = hasMedia || recordings.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // SINGLE SOURCE OF TRUTH — nowPlaying
  // Every consumer (mini-player color, equalizer, subtitle, play button,
  // progress bar, checkmark in dropdown) MUST read from this one object.
  // This eliminates all desync between the iframe state and recording state.
  // Pattern: Derived State — computed deterministically from authoritative state.
  // ─────────────────────────────────────────────────────────────────────────
  const nowPlaying = useMemo(() => {
    // Build the potential objects for both domains if they exist
    const recordingInfo = activePlaybackId ? {
      type: 'recording' as const,
      isPlaying: isRecordingPlaying,
      label: recordings.find(r => r.id === activePlaybackId)?.recording_name ?? t('miniPlayer.source.userRecording'),
      recordingId: activePlaybackId,
      source: null as null,
      currentTime: recordingCurrentTime,
      duration: recordingDuration,
    } : null;

    const mediaInfo = playingSource ? {
      type: 'media' as const,
      isPlaying: isMediaPlaying,
      label: playingSource === 'youtube' ? t('miniPlayer.source.youtube') : playingSource === 'soundcloud' ? t('miniPlayer.source.soundcloud') : t('miniPlayer.source.spotify'),
      recordingId: null as null,
      source: playingSource,
      currentTime: mediaCurrentTime,
      duration: mediaDuration,
    } : null;

    // Use activeDomain to decide which one wins if BOTH exist
    if (activeDomain === 'media' && mediaInfo) return mediaInfo;
    if (activeDomain === 'recording' && recordingInfo) return recordingInfo;
    
    // Fallbacks if one exists but it wasn't the active domain (e.g. initial load)
    if (recordingInfo) return recordingInfo;
    if (mediaInfo) return mediaInfo;

    const firstRec = recordings[0];
    return {
      type: 'idle' as const,
      isPlaying: false,
      label: hasMedia ? t('miniPlayer.source.select') : (firstRec?.recording_name ?? t('miniPlayer.source.select')),
      recordingId: null as null,
      source: null as null,
      currentTime: 0,
      duration: 1,
    };
  }, [
    activePlaybackId, isRecordingPlaying, recordingCurrentTime, recordingDuration,
    playingSource, isMediaPlaying, mediaCurrentTime, mediaDuration,
    recordings, hasMedia, activeDomain, t,
  ]);
  const [isPendingOrder, startOrderTransition] = useTransition();

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = recordings.findIndex((r) => r.id === active.id);
    const newIndex = recordings.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(recordings, oldIndex, newIndex);

    setRecordings(reordered);

    startOrderTransition(async () => {
      const res = await reorderUserRecordings(reordered.map((r) => r.id));
      if (!res.success) {
        toast.error(t('rehearsal.sort.error'));
      }
    });
  };

  const pauseYouTube = () => {
    if (youtubeRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastYtMessage = '{"event":"command","func":"pauseVideo","args":""}';
        return;
      }
      youtubeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*"
      );
    }
  };

  const playYouTube = () => {
    pauseSoundCloud();
    if (youtubeRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastYtMessage = '{"event":"command","func":"playVideo","args":""}';
        return;
      }
      youtubeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*"
      );
    }
  };

  const seekYouTube = (seconds: number) => {
    if (youtubeRef.current?.contentWindow) {
      const targetTime = Math.max(0, Math.min(mediaDuration, mediaCurrentTime + seconds));
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastYtMessage = JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [targetTime, true],
        });
        setMediaCurrentTime(targetTime);
        return;
      }
      youtubeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [targetTime, true],
        }),
        "*"
      );
      setMediaCurrentTime(targetTime);
    }
  };

  const pauseSoundCloud = () => {
    if (soundcloudRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastScMessage = '{"method":"pause"}';
        return;
      }
      soundcloudRef.current.contentWindow.postMessage(
        '{"method":"pause"}',
        "*"
      );
    }
  };

  const playSoundCloud = () => {
    pauseYouTube();
    if (soundcloudRef.current?.contentWindow) {
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastScMessage = '{"method":"play"}';
        return;
      }
      soundcloudRef.current.contentWindow.postMessage(
        '{"method":"play"}',
        "*"
      );
    }
  };

  const seekSoundCloud = (seconds: number) => {
    if (soundcloudRef.current?.contentWindow) {
      const targetTime = Math.max(0, Math.min(mediaDuration, mediaCurrentTime + seconds));
      if (typeof window !== "undefined" && (window as any).__E2E__) {
        (window as any).lastScMessage = JSON.stringify({
          method: "seekTo",
          value: targetTime * 1000,
        });
        setMediaCurrentTime(targetTime);
        return;
      }
      soundcloudRef.current.contentWindow.postMessage(
        JSON.stringify({
          method: "seekTo",
          value: targetTime * 1000,
        }),
        "*"
      );
      setMediaCurrentTime(targetTime);
    }
  };

  const handleSliderClickHorizontal = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetTime = percentage * (activePlaybackId ? recordingDuration : mediaDuration);

    if (activePlaybackId) {
      seekActiveRecording(targetTime);
      return;
    }

    if (activePlaybackId) {
      seekActiveRecording(targetTime);
      return;
    }
    if (playingSource === "youtube") {
      if (youtubeRef.current?.contentWindow) {
        if (typeof window !== "undefined" && (window as any).__E2E__) {
          (window as any).lastYtMessage = JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [targetTime, true],
          });
          setMediaCurrentTime(targetTime);
          return;
        }
        youtubeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [targetTime, true],
          }),
          "*"
        );
        setMediaCurrentTime(targetTime);
      }
    } else if (playingSource === "soundcloud") {
      if (soundcloudRef.current?.contentWindow) {
        if (typeof window !== "undefined" && (window as any).__E2E__) {
          (window as any).lastScMessage = JSON.stringify({
            method: "seekTo",
            value: targetTime * 1000,
          });
          setMediaCurrentTime(targetTime);
          return;
        }
        soundcloudRef.current.contentWindow.postMessage(
          JSON.stringify({
            method: "seekTo",
            value: targetTime * 1000,
          }),
          "*"
        );
        setMediaCurrentTime(targetTime);
      }
    }
  };

  
  const seekRelative = (seconds: number) => {
    if (activePlaybackId) {
      seekRelativeActiveRecording(seconds);
      return;
    }
    if (playingSource === "youtube") {
      seekYouTube(seconds);
    } else if (playingSource === "soundcloud") {
      seekSoundCloud(seconds);
    }
  };

  // Hidden refs for mini-player playback (always mounted in DOM)



  const startMediaPlayback = () => {
    if (playingSource === "youtube") {
      playYouTube();
    } else if (playingSource === "soundcloud") {
      playSoundCloud();
    } else if (youtubeUrl) {
      setSelectedMedia("youtube");
      setPlayingSource("youtube");
      setTimeout(() => {
        bindYouTubeEvents();
        playYouTube();
      }, 300);
    } else if (soundcloudUrl) {
      setSelectedMedia("soundcloud");
      setPlayingSource("soundcloud");
      setTimeout(() => {
        bindSoundCloudEvents();
        playSoundCloud();
      }, 300);
    } else if (spotifyUrl) {
      onOpen?.();
      setSelectedMedia("spotify");
      setPlayingSource("spotify");
    }
  };

  const handleMiniPlayerPlayPause = () => {
    if (activePlaybackId && activeRecording) {
      contextHandleTogglePlay(activeRecording, activeRecording.audioUrl);
      return;
    }
    if (!playingSource) {
      if (recordings && recordings.length > 0) {
        const first = recordings[0];
        if (first.audioUrl) contextHandleTogglePlay(first, first.audioUrl);
      } else {
        startMediaPlayback();
      }
      return;
    }
    if (playingSource === "youtube") {
      if (isMediaPlaying) {
        pauseYouTube();
      } else if (youtubeRef.current?.contentWindow) {
        playYouTube();
      } else {
        playYouTube();
      }
    } else if (playingSource === "soundcloud") {
      if (isMediaPlaying) {
        pauseSoundCloud();
      } else if (soundcloudRef.current?.contentWindow) {
        playSoundCloud();
      } else {
        playSoundCloud();
      }
    }
  };

  // ----------------------------------------------------------------------
  // ARCHITECTURAL FIX: Global Audio Mutual Exclusivity (last-in-wins)
  // We track what CHANGED to determine which source just became active
  // and pause the OTHER one — never pausing what just started.
  // ----------------------------------------------------------------------
  const prevIsRecordingPlaying = React.useRef(false);
  const prevIsMediaPlaying = React.useRef(false);

  useEffect(() => {
    const recordingJustStarted = isRecordingPlaying && !prevIsRecordingPlaying.current;
    const mediaJustStarted = isMediaPlaying && !prevIsMediaPlaying.current;

    if (recordingJustStarted) {
      setActiveDomain('recording');
      if (isMediaPlaying) {
        // Recording just started → pause any active iframe and clear its state
        if (playingSource === "youtube") pauseYouTube();
        else if (playingSource === "soundcloud") pauseSoundCloud();
        setIsMediaPlaying(false);
        setPlayingSource(null);
      }
    }

    if (mediaJustStarted) {
      setActiveDomain('media');
      if (isRecordingPlaying) {
        // Iframe media just started → pause any active recording
        pauseActiveRecording();
      }
    }

    prevIsRecordingPlaying.current = isRecordingPlaying;
    prevIsMediaPlaying.current = isMediaPlaying;
  }, [isRecordingPlaying, isMediaPlaying, playingSource, pauseActiveRecording]);

  // postMessage event listener for YouTube / SoundCloud state syncing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // YouTube messages
        if (data.event === "onStateChange") {
          const state = Number(data.info);
          if (state === 1 || state === 3) {
            setIsMediaPlaying(true);
            setPlayingSource("youtube");
            pauseSoundCloud();
          } else if (state === 2 || state === 0 || state === -1) {
            setIsMediaPlaying(false);
          }
        }
        if (data.event === "infoDelivery" && data.info) {
          if (data.info.currentTime !== undefined) {
            setMediaCurrentTime(data.info.currentTime);
          }
          if (data.info.duration !== undefined) {
            setMediaDuration(data.info.duration);
          }
        }

        // SoundCloud messages
        if (data.event === "play" || data.method === "play" || data.action === "play") {
          setIsMediaPlaying(true);
          setPlayingSource("soundcloud");
          pauseYouTube();
        } else if (data.event === "pause" || data.method === "pause" || data.action === "pause") {
          setIsMediaPlaying(false);
        } else if (data.event === "playProgress") {
          const progressData = data.data || data.value;
          if (progressData) {
            if (progressData.currentPosition !== undefined) {
              setMediaCurrentTime(progressData.currentPosition / 1000);
            }
            if (progressData.duration !== undefined) {
              setMediaDuration(progressData.duration / 1000);
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Spotify focus-blur iframe click detection
  useEffect(() => {
    console.log("[E2E Debug] Registering handleBlur, selectedMedia =", selectedMedia);
    const handleBlur = () => {
      console.log("[E2E Debug] handleBlur triggered");
      // Delay slightly to allow activeElement to resolve
      setTimeout(() => {
        if (document.activeElement) {
          console.log("[E2E Debug] activeElement:", document.activeElement.tagName, (document.activeElement as any).src);
        }
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          const iframe = document.activeElement as HTMLIFrameElement;
          console.log("[E2E Debug] iframe.src:", iframe.src, "selectedMedia:", selectedMedia);
          if (selectedMedia === 'spotify' || (iframe.src && iframe.src.includes('spotify.com'))) {
            console.log("[E2E Debug] Spotify matched, pausing others");
            setIsMediaPlaying(true);
            setPlayingSource("spotify");
            // Pause other controllable sources immediately
            pauseYouTube();
            pauseSoundCloud();
          }
        }
      }, 100);
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      console.log("[E2E Debug] Cleaning up handleBlur for selectedMedia =", selectedMedia);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedMedia]);

  // Sync progress for User Recordings
  useEffect(() => {
    let animationFrameId: number;
    const activeAudio = activePlaybackId ? audioElements[activePlaybackId] : null;

    if (activeAudio) {
      const updateProgress = () => {
        if (activePlaybackId) {
          setMediaCurrentTime(activeAudio.currentTime);
          setMediaDuration(activeAudio.duration || 1);
        }
        animationFrameId = requestAnimationFrame(updateProgress);
      };
      updateProgress();
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activePlaybackId, audioElements]);

  const queryClient = useQueryClient();

  // Handle new recording saved
  const handleRecordingSaved = (newRecording: UserRecording) => {
    setRecordings((prev) => [newRecording, ...prev]);
    toast.success(t('recorder.save.success'), {
      action: {
        label: t('recorder.viewRecordings'),
        onClick: () => { window.location.href = '/songs?myRecordings=true'; },
      },
      classNames: {
        actionButton: 'text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors ml-2',
      },
    });
    queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
    queryClient.invalidateQueries({ queryKey: ["user-recordings-compositions"] });
    queryClient.invalidateQueries({ queryKey: ["global-filter-counts"] });
  };

  // Handle delete recording
  const handleRename = async (recordingId: string, newName: string) => {
    const originalName = recordings.find((r) => r.id === recordingId)?.recording_name;
    setRecordings((prev) => prev.map((r) => (r.id === recordingId ? { ...r, recording_name: newName } : r)));
    const { success } = await renameUserRecording(recordingId, newName);
    if (!success) {
      toast.error(t('rehearsal.recording.rename.error'));
      setRecordings((prev) => prev.map((r) => (r.id === recordingId ? { ...r, recording_name: originalName || "" } : r)));
    } else {
      queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
    }
  };

  const handleDelete = async (recordingId: string, storagePath: string) => {
    setDeletingId(recordingId);
    try {
      // Pause if currently playing
      if (activePlaybackId === recordingId) {
        stopActiveRecording();
      }

      const success = await deleteUserRecording(recordingId, storagePath);
      if (success) {
        setRecordings((prev) => prev.filter((r) => r.id !== recordingId));
        toast.success(t('rehearsal.recording.delete.success'));
        queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
        queryClient.invalidateQueries({ queryKey: ["user-recordings-compositions"] });
        queryClient.invalidateQueries({ queryKey: ["global-filter-counts"] });
      } else {
        toast.error(t('rehearsal.recording.delete.error'));
      }
    } catch (err) {
      console.error("[drawer] Delete error:", err);
      toast.error(t('rehearsal.recording.delete.error'));
    } finally {
      setDeletingId(null);
    }
  };

  // Handle download recording (strictly DRM-lite protected: owner only)
  const handleDownload = async (rec: UserRecording) => {
    if (rec.is_owner === false || rec.can_download === false) {
      toast.error(t('recording.sharing.cannotDownload'));
      return;
    }
    if (!rec.audioUrl) {
      toast.error(t('recorder.audio.missing'));
      return;
    }
    setDownloadingId(rec.id);
    try {
      const rawExt = rec.storage_path ? rec.storage_path.split('.').pop()?.toLowerCase() || 'webm' : 'webm';
      let filename = rec.recording_name.trim();
      if (!filename.toLowerCase().endsWith(`.${rawExt}`)) {
        filename = `${filename}.${rawExt}`;
      }
      filename = filename.replace(/[<>:"/\\|?*]/g, '_');

      const res = await fetch(rec.audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(t('recorder.download.success'));
    } catch (err) {
      console.error("[drawer] Download error:", err);
      try {
        const a = document.createElement("a");
        a.href = rec.audioUrl;
        a.target = "_blank";
        a.download = rec.recording_name || "recording";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        toast.error(t('recorder.download.error'));
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = (rec: UserRecording) => {
    if (isSongPublic === false) {
      if (isSongOwner || isAdmin) {
        setPrivateSongPromptRecording(rec);
      } else {
        toast.error(t('recording.sharing.privateSongPrompt.notOwner'));
      }
      return;
    }
    setShareRecording(rec);
  };

  const handlePublish = async (rec: UserRecording) => {
    if (rec.is_public) {
      const res = await unpublishRecording(rec.id);
      if (res.success) {
        toast.success(t('recording.publish.privateSuccess'));
        setRecordings((prev) =>
          prev.map((r) => (r.id === rec.id ? { ...r, is_public: false } : r))
        );
        queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
      } else {
        toast.error(res.error || t('recording.publish.error'));
      }
    } else {
      setPublishRecording(rec);
    }
  };

  const handleAttribution = (rec: UserRecording) => {
    setAttributionRecording(rec);
  };

  // Custom play/pause control handler

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @keyframes eq1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes eq2 {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        @keyframes eq3 {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
        .animate-eq-bar-1 { animation: eq1 0.8s ease-in-out infinite; }
        .animate-eq-bar-2 { animation: eq2 0.5s ease-in-out infinite; }
        .animate-eq-bar-3 { animation: eq3 0.7s ease-in-out infinite; }
      `}</style>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0, pointerEvents: "none" }}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none"
        }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      />

      {/* Bottom Drawer Sheet */}
      <motion.div
        initial={{ y: "100%", visibility: "hidden" }}
        animate={isOpen ? {
          y: 0,
          visibility: "visible"
        } : {
          y: "100%",
          transitionEnd: {
            visibility: "hidden"
          }
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-3xl shadow-2xl z-50 max-h-[90vh] md:max-h-[80vh] flex flex-col w-full max-w-xl mx-auto border-x pb-safe-bottom"
      >
            {/* Header handle */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 shrink-0 cursor-pointer" onClick={onClose} />

            {/* Header Title bar */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <Music className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('rehearsal.title')}</h3>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-[250px] md:max-w-[320px]">
                    {songTitle}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

             {/* Tabs Navigation */}
            {hasMedia && (
              <div className="flex px-6 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
                <button
                  onClick={() => setActiveTab("media")}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
                    activeTab === "media"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t('rehearsal.tab.reference')}
                </button>
                <button
                  onClick={() => setActiveTab("recorder")}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
                    activeTab === "recorder"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t('rehearsal.tab.voiceRecorder')}
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${hasAnyAudioSource ? 'pb-24' : ''}`}>
              
              <div className="relative" style={{ display: activeTab === "recorder" ? "block" : "none" }}>
                  {/* Blurred overlay wrapper if guest */}
                  <div className={!user ? "blur-[4px] pointer-events-none select-none" : ""}>
                    {/* Sticky Mini-Player Status Bar */}
                    {hasMedia && selectedMedia && (
                      <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 rounded-2xl shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">
                            {selectedMedia === "youtube" && t('rehearsal.reference.loaded.youtube')}
                            {selectedMedia === "soundcloud" && t('rehearsal.reference.loaded.soundcloud')}
                            {selectedMedia === "spotify" && t('rehearsal.reference.loaded.spotify')}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab("media")}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                        >
                          {t('rehearsal.controlTrack')}
                        </button>
                      </div>
                    )}

                    {/* Audio Recorder Area */}
                    <section className="space-y-2">
                      <div className="flex items-baseline justify-end">
                        {hasMedia && (
                          <span className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 font-medium">
                            {t('rehearsal.headphonesHint')}
                          </span>
                        )}
                      </div>
                      <AudioRecorder songVersionId={songVersionId} onRecordingSaved={handleRecordingSaved} />
                    </section>

                    {/* Saved Practice Takes List */}
                    <section className="mt-6 space-y-3">
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left">{t('rehearsal.recordings.yourRecordings')}</h3>
                      
                      {/* Fake practice takes mock list for guest demo preview */}
                      {!user ? (
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950 p-1 space-y-0.5">
                          {[t('rehearsal.demo.take1'), t('rehearsal.demo.take2')].map((name) => (
                            <div key={name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl">
                              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Play className="w-3.5 h-3.5 fill-current translate-x-px" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Jul 1, 2026 · 0:30</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-2">
                          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                          <span className="text-xs text-gray-400">{t('rehearsal.loadingRecordings')}</span>
                        </div>
                      ) : recordings.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                          <p className="text-2xl mb-1">🎤</p>
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('rehearsal.recordings.empty')}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] mx-auto">
                            {t('rehearsal.recordings.emptyPracticeHint')}
                          </p>
                        </div>
                      ) : (
                        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext
                            items={recordings.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950 p-1 space-y-0.5">
                              {recordings.map((rec) => (
                                <SortableRecordingItem
                                  key={rec.id}
                                  rec={rec}
                                  activePlaybackId={activePlaybackId}
                                  isRecordingPlaying={isRecordingPlaying}
                                  deletingId={deletingId}
                                  downloadingId={downloadingId}
                                  handleTogglePlay={(id, url) => { const rec = recordings.find(r => r.id === id); if (rec) contextHandleTogglePlay(rec, url); }}
                                  handleDelete={(id) => setPendingDelete(recordings.find((r) => r.id === id) ?? null)}
                                  handleRename={handleRename}
                                  handleDownload={handleDownload}
                                  handleShare={handleShare}
                                  handlePublish={handlePublish}
                                  handleAttribution={handleAttribution}
                                  formatDate={formatDate}
                                  isCustomSort={recordings.length > 1}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </section>
                  </div>

                  {/* CTA Lock Overlay Card */}
                  {!user && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-auto">
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl max-w-sm space-y-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('rehearsal.guest.title')}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {t('rehearsal.guest.description')}
                          </p>
                        </div>
                        <Link href="/auth/login">
                          <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
                            {t('rehearsal.guest.signIn')}
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

              <div className="space-y-6 text-left" style={activeTab !== "media" ? { visibility: "hidden", height: 0, overflow: "hidden", margin: 0, padding: 0 } : undefined}>
                  {/* Media Selector Buttons (only if more than 1 media type exists) */}
                  {((youtubeUrl ? 1 : 0) + (spotifyUrl ? 1 : 0) + (soundcloudUrl ? 1 : 0)) > 1 && (
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-950 rounded-xl">
                      {youtubeUrl && (
                        <button
                          onClick={() => setSelectedMedia("youtube")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedMedia === "youtube"
                              ? "bg-white dark:bg-gray-800 text-red-550 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          YouTube
                        </button>
                      )}
                      {soundcloudUrl && (
                        <button
                          onClick={() => setSelectedMedia("soundcloud")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedMedia === "soundcloud"
                              ? "bg-white dark:bg-gray-800 text-[#ff5500] shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          SoundCloud
                        </button>
                      )}
                      {spotifyUrl && (
                        <button
                          onClick={() => setSelectedMedia("spotify")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedMedia === "spotify"
                              ? "bg-white dark:bg-gray-800 text-[#1db954] shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Spotify
                        </button>
                      )}
                    </div>
                  )}

                  {/* YouTube Player */}
                  {youtubeUrl && (
                    <div 
                      className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-black"
                      style={{ display: selectedMedia === "youtube" ? "block" : "none" }}
                    >
                      <iframe
                        ref={youtubeRef}
                        onLoad={bindYouTubeEvents}
                        width="100%"
                        height="100%"
                        src={typeof window !== "undefined" && (window as any).__E2E__ ? "about:blank" : getYouTubeEmbedUrl(youtubeUrl)}
                        title={t('mediaEmbeds.youtubeTitle')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {/* SoundCloud Player */}
                  {soundcloudUrl && (
                    <div 
                      className="h-[166px] w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800"
                      style={{ display: selectedMedia === "soundcloud" ? "block" : "none" }}
                    >
                      <iframe
                        ref={soundcloudRef}
                        onLoad={bindSoundCloudEvents}
                        width="100%"
                        height="166"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={typeof window !== "undefined" && (window as any).__E2E__ ? "about:blank" : `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                      ></iframe>
                    </div>
                  )}

                  {/* Spotify Player */}
                  {spotifyUrl && (
                    <div 
                      className="h-[152px] w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800"
                      style={{ display: selectedMedia === "spotify" ? "block" : "none" }}
                    >
                      <iframe
                        src={typeof window !== "undefined" && (window as any).__E2E__ ? "about:blank" : `https://open.spotify.com/embed/track/${spotifyUrl.split('/track/')[1]?.split('?')[0]}`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                </div>

            </div>
          </motion.div>

      {/* Floating Horizontal Bottom Mini Player Widget */}
      {hasAnyAudioSource && (

        <div 
          data-testid="bottom-mini-player"
          className={`fixed bottom-[calc(var(--bottom-nav-height,3.5rem)+env(safe-area-inset-bottom,0px))] lg:bottom-4 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 z-[60] w-full lg:max-w-xl lg:rounded-2xl shadow-2xl backdrop-blur-md text-white h-14 flex items-center justify-between px-4 border-t lg:border border-white/10 select-none animate-in slide-in-from-bottom duration-300 ${nowPlaying.type === 'recording' ? 'bg-indigo-600/95' : 'bg-[#FF5500]/95'}`}
        >
          {/* Visual Progress Bar (Clipped to container corners) */}
          <div className="absolute inset-0 pointer-events-none lg:rounded-2xl overflow-hidden z-0">
            <div className="absolute top-0 inset-x-0 h-1 bg-white/20">
              <div 
                className="h-full bg-white"
                style={{ width: `${Math.min(100, (nowPlaying.currentTime / (nowPlaying.duration || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Interactive Hit Area & Hover Thumb (Unclipped so thumb can extend above container) */}
          <div 
            onClick={handleSliderClickHorizontal}
            data-testid="mini-progress-bar"
            className="absolute top-0 inset-x-0 h-2 -mt-1 cursor-pointer group z-40 flex items-center"
          >
            <div 
              className="w-3 h-3 bg-white rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${Math.min(100, (nowPlaying.currentTime / (nowPlaying.duration || 1)) * 100)}% - 6px)` }}
            />
          </div>

          {/* Equalizer & Source Switcher Dropdown */}
          <div className="flex items-center gap-3 flex-1 min-w-0 h-full py-2 cursor-pointer" onClick={onOpen}>
            <div className="flex gap-0.5 items-end h-4 w-4 shrink-0 justify-center cursor-pointer">
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${nowPlaying.isPlaying ? 'animate-eq-bar-1' : 'h-1.5'}`} />
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${nowPlaying.isPlaying ? 'animate-eq-bar-2' : 'h-3'}`} />
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${nowPlaying.isPlaying ? 'animate-eq-bar-3' : 'h-2'}`} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  data-testid="mini-source-switcher" 
                  className="flex flex-col text-left min-w-0 cursor-pointer hover:bg-white/10 rounded px-2 -mx-2 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black truncate">{songTitle}</span>
                    <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest opacity-80 truncate">
                    {nowPlaying.label}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-2 z-[60]" data-testid="mini-source-dropdown">
                {hasMedia && (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2 pb-1">{t('rehearsal.tab.reference')}</DropdownMenuLabel>
                    {youtubeUrl && (
                      <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white rounded-md transition-colors my-0.5" onClick={() => {
                        stopActiveRecording();
                        pauseSoundCloud();
                        setSelectedMedia("youtube");
                        setPlayingSource("youtube");
                        setTimeout(() => { bindYouTubeEvents(); playYouTube(); }, 300);
                      }}>
                        <div className="flex items-center justify-between w-full">
                          <span>YouTube</span>
                          {nowPlaying.type === 'media' && nowPlaying.source === 'youtube' && <Check className="w-4 h-4 ml-2" />}
                        </div>
                      </DropdownMenuItem>
                    )}
                    {soundcloudUrl && (
                      <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white rounded-md transition-colors my-0.5" onClick={() => {
                        stopActiveRecording();
                        pauseYouTube();
                        setSelectedMedia("soundcloud");
                        setPlayingSource("soundcloud");
                        setTimeout(() => { bindSoundCloudEvents(); playSoundCloud(); }, 300);
                      }}>
                        <div className="flex items-center justify-between w-full">
                          <span>SoundCloud</span>
                          {nowPlaying.type === 'media' && nowPlaying.source === 'soundcloud' && <Check className="w-4 h-4 ml-2" />}
                        </div>
                      </DropdownMenuItem>
                    )}
                    {spotifyUrl && (
                      <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white rounded-md transition-colors my-0.5" onClick={() => {
                        stopActiveRecording();
                        onOpen?.();
                        setSelectedMedia("spotify");
                        setPlayingSource("spotify");
                      }}>
                        <div className="flex items-center justify-between w-full">
                          <span>Spotify</span>
                          {nowPlaying.type === 'media' && nowPlaying.source === 'spotify' && <Check className="w-4 h-4 ml-2" />}
                        </div>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {recordings.length > 0 && (
                  <>
                    {hasMedia && <DropdownMenuSeparator className="bg-white/10 my-2" />}
                    <DropdownMenuLabel>{t('miniPlayer.source.userRecordings')}</DropdownMenuLabel>
                    {recordings.map(rec => (
                      <DropdownMenuItem key={rec.id} onClick={() => {
                        if (!rec.audioUrl) return;
                        contextHandleTogglePlay(rec, rec.audioUrl);
                      }}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{rec.recording_name}</span>
                          {nowPlaying.type === 'recording' && nowPlaying.recordingId === rec.id && <Check className="w-4 h-4 ml-2" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 ml-4 shrink-0">
            {/* Seek Back */}
            {(nowPlaying.source || nowPlaying.recordingId) && (
              <button 
                onClick={() => seekRelative(-15)}
                data-testid="mini-seek-back-btn"
                title={t('miniPlayer.seekBack')}
                className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-[18px] h-[18px]" />
              </button>
            )}

            {/* Play/Pause */}
            <button 
              onClick={handleMiniPlayerPlayPause}
              data-testid="mini-play-pause-btn"
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 shrink-0"
            >
              {nowPlaying.isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Seek Forward */}
            {(playingSource || activePlaybackId) && (
              <button 
                onClick={() => seekRelative(15)}
                data-testid="mini-seek-forward-btn"
                title={t('miniPlayer.seekForward')}
                className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <RotateCw className="w-[18px] h-[18px]" />
              </button>
            )}

            <span className="w-px h-6 bg-white/10 mx-1 shrink-0" />

            {/* Expand Drawer */}
            <button 
              onClick={onOpen}
              data-testid="mini-expand-btn"
              title={t('miniPlayer.expand')}
              className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Close/Stop */}
            {(playingSource || activePlaybackId) && (
              <button 
                onClick={() => {
                  if (activePlaybackId) {
                    stopActiveRecording();
                  } else {
                    pauseYouTube();
                    pauseSoundCloud();
                    setPlayingSource(null);
                    setIsMediaPlaying(false);
                  }
                }}
                data-testid="mini-close-btn"
                title={t('miniPlayer.stop')}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Private Song Sharing Confirmation Dialog */}
      {privateSongPromptRecording && (
        <Dialog open={!!privateSongPromptRecording} onOpenChange={(open) => !open && setPrivateSongPromptRecording(null)}>
          <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Lock className="w-5 h-5 text-amber-500" />
                {t('recording.sharing.privateSongPrompt.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-2 leading-relaxed">
                {t('recording.sharing.privateSongPrompt.body')}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setPrivateSongPromptRecording(null)}
                disabled={isPublishingSong}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={isPublishingSong}
                onClick={async () => {
                  if (!onMakeSongPublic) return;
                  setIsPublishingSong(true);
                  try {
                    const success = await onMakeSongPublic();
                    if (success) {
                      const rec = privateSongPromptRecording;
                      setPrivateSongPromptRecording(null);
                      setShareRecording(rec);
                    }
                  } finally {
                    setIsPublishingSong(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishingSong ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>{t('recording.sharing.privateSongPrompt.confirm')}</span>
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Recording Sharing Modal */}
      {shareRecording && (
        <RecordingShareModal
          isOpen={!!shareRecording}
          onClose={() => setShareRecording(null)}
          recording={shareRecording}
          onSharesUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
          }}
        />
      )}

      {/* Recording Publish Modal (with Singer Consent Disclaimer) */}
      {publishRecording && (
        <RecordingPublishModal
          isOpen={!!publishRecording}
          onClose={() => setPublishRecording(null)}
          recording={publishRecording}
          onPublished={() => {
            queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
          }}
        />
      )}

      {/* Delete confirmation: deleting removes the audio file for good */}
      <DeleteConfirmationModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDelete(pendingDelete.id, pendingDelete.storage_path);
          setPendingDelete(null);
        }}
        title={t('rehearsal.recording.delete.confirmTitle')}
        message={t('rehearsal.recording.delete.confirmMessage', { name: pendingDelete?.recording_name ?? '' })}
        isDeleting={!!pendingDelete && deletingId === pendingDelete.id}
      />

      {/* Singer Attribution Modal */}
      {attributionRecording && (
        <RecordingAttributionModal
          isOpen={!!attributionRecording}
          onClose={() => setAttributionRecording(null)}
          recording={attributionRecording}
          onAttributionUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["song-recordings", songVersionId] });
          }}
        />
      )}
    </>
  );
}
