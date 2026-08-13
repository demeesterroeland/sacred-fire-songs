"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Trash2, Calendar, Play, Pause, Lock, RotateCcw, RotateCw, GripVertical } from "lucide-react";
import { toast } from "sonner";
import AudioRecorder from "./AudioRecorder";
import { getUserRecordings, deleteUserRecording, reorderUserRecordings, type UserRecording } from "@/lib/actions/rehearsal";
import { getYouTubeEmbedUrl, getSpotifyEmbedUrl } from "./MediaEmbeds";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
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
  deletingId,
  handleTogglePlay,
  handleDelete,
  formatDate,
  isCustomSort,
}: {
  rec: UserRecording;
  activePlaybackId: string | null;
  deletingId: string | null;
  handleTogglePlay: (id: string, url: string | undefined) => void;
  handleDelete: (id: string, path: string) => void;
  formatDate: (date: string) => string;
  isCustomSort: boolean;
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 group"
    >
      {/* Drag handle (shown when custom sort is active) */}
      {isCustomSort && (
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={() => handleTogglePlay(rec.id, rec.audioUrl)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm shrink-0 ${
          activePlaybackId === rec.id
            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
            : "bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400"
        }`}
      >
        {activePlaybackId === rec.id ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Title and date */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
          {rec.recording_name}
        </h4>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
          <Calendar className="w-3 h-3" />
          {formatDate(rec.created_at)}
        </span>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => handleDelete(rec.id, rec.storage_path)}
        disabled={deletingId === rec.id}
        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95 shrink-0"
        title="Delete rehearsal"
      >
        {deletingId === rec.id ? (
          <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
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
}: RehearsalDrawerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recorder" | "media">("media");
  const [selectedMedia, setSelectedMedia] = useState<"youtube" | "spotify" | "soundcloud" | null>(null);

  // Refs for media iframe elements
  const youtubeRef = React.useRef<HTMLIFrameElement>(null);
  const soundcloudRef = React.useRef<HTMLIFrameElement>(null);

  // Staging media control states
  const [playingSource, setPlayingSource] = useState<"youtube" | "soundcloud" | "spotify" | null>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(1);

  const hasMedia = !!(youtubeUrl || spotifyUrl || soundcloudUrl);

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

    // Default to Reference Tracks (media) if the song has media
    if (youtubeUrl || spotifyUrl || soundcloudUrl) {
      setActiveTab("media");
    } else {
      setActiveTab("recorder");
    }
  }, [youtubeUrl, soundcloudUrl, spotifyUrl, user]);

  const [recordings, setRecordings] = useState<UserRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        toast.error("Failed to save recording order");
      }
    });
  };
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  // Fetch recordings
  const fetchRecordings = async () => {
    setIsLoading(true);
    try {
      const data = await getUserRecordings(songVersionId);
      setRecordings(data);
    } catch (err) {
      console.error("[drawer] Failed to fetch recordings:", err);
      toast.error("Failed to load your rehearsal recordings.");
    } finally {
      setIsLoading(false);
    }
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
    const targetTime = percentage * mediaDuration;

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
    if (playingSource === "youtube") {
      seekYouTube(seconds);
    } else if (playingSource === "soundcloud") {
      seekSoundCloud(seconds);
    }
  };

  // Hidden refs for mini-player playback (always mounted in DOM)
  const hiddenYoutubeRef = React.useRef<HTMLIFrameElement>(null);
  const hiddenSoundcloudRef = React.useRef<HTMLIFrameElement>(null);

  const playHiddenYouTube = () => {
    if (hiddenYoutubeRef.current?.contentWindow) {
      hiddenYoutubeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  };

  const playHiddenSoundCloud = () => {
    if (hiddenSoundcloudRef.current?.contentWindow) {
      hiddenSoundcloudRef.current.contentWindow.postMessage('{"method":"play"}', '*');
    }
  };

  const startMediaPlayback = () => {
    if (playingSource === "youtube") {
      playHiddenYouTube();
    } else if (playingSource === "soundcloud") {
      playHiddenSoundCloud();
    } else if (youtubeUrl) {
      setSelectedMedia("youtube");
      setPlayingSource("youtube");
      setTimeout(() => {
        bindYouTubeEvents();
        playHiddenYouTube();
      }, 300);
    } else if (soundcloudUrl) {
      setSelectedMedia("soundcloud");
      setPlayingSource("soundcloud");
      setTimeout(() => {
        bindSoundCloudEvents();
        playHiddenSoundCloud();
      }, 300);
    } else if (spotifyUrl) {
      onOpen?.();
      setSelectedMedia("spotify");
      setPlayingSource("spotify");
    }
  };

  const handleMiniPlayerPlayPause = () => {
    if (!playingSource) {
      startMediaPlayback();
      return;
    }
    if (playingSource === "youtube") {
      if (isMediaPlaying) {
        pauseYouTube();
      } else if (youtubeRef.current?.contentWindow) {
        playYouTube();
      } else {
        playHiddenYouTube();
      }
    } else if (playingSource === "soundcloud") {
      if (isMediaPlaying) {
        pauseSoundCloud();
      } else if (soundcloudRef.current?.contentWindow) {
        playSoundCloud();
      } else {
        playHiddenSoundCloud();
      }
    }
  };

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

  useEffect(() => {
    if (isOpen && songVersionId) {
      fetchRecordings();
    }
    // Clean up audio elements on unmount or close
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
      });
    };
  }, [isOpen, songVersionId]);

  const queryClient = useQueryClient();

  // Handle new recording saved
  const handleRecordingSaved = (newRecording: UserRecording) => {
    setRecordings((prev) => [newRecording, ...prev]);
    toast.success("Rehearsal recording saved successfully!");
    queryClient.invalidateQueries({ queryKey: ["user-recordings-compositions"] });
    queryClient.invalidateQueries({ queryKey: ["global-filter-counts"] });
  };

  // Handle delete recording
  const handleDelete = async (recordingId: string, storagePath: string) => {
    setDeletingId(recordingId);
    try {
      // Pause if currently playing
      if (activePlaybackId === recordingId) {
        handleTogglePlay(recordingId, "");
      }

      const success = await deleteUserRecording(recordingId, storagePath);
      if (success) {
        setRecordings((prev) => prev.filter((r) => r.id !== recordingId));
        toast.success("Recording deleted.");
        queryClient.invalidateQueries({ queryKey: ["user-recordings-compositions"] });
        queryClient.invalidateQueries({ queryKey: ["global-filter-counts"] });
      } else {
        toast.error("Failed to delete recording.");
      }
    } catch (err) {
      console.error("[drawer] Delete error:", err);
      toast.error("Failed to delete recording.");
    } finally {
      setDeletingId(null);
    }
  };

  // Custom play/pause control handler
  const handleTogglePlay = (recordingId: string, audioUrl: string | undefined) => {
    console.log("[rehearsal] handleTogglePlay called:", { recordingId, audioUrl });

    if (!audioUrl) {
      console.warn("[rehearsal] Audio URL missing for recordingId:", recordingId);
      toast.error("Audio URL is not available.");
      return;
    }

    // Stop current active playing audio if it's different
    if (activePlaybackId && activePlaybackId !== recordingId) {
      const activeAudio = audioElements[activePlaybackId];
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
    }

    let audio = audioElements[recordingId];
    
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.onended = () => {
        setActivePlaybackId(null);
      };
      audio.onerror = (e) => {
        console.error("[rehearsal] HTMLAudioElement error event:", e, {
          src: audio.src,
          error: audio.error,
          code: audio.error?.code,
          message: audio.error?.message,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
      };
      setAudioElements(prev => ({ ...prev, [recordingId]: audio }));
    }

    if (activePlaybackId === recordingId) {
      audio.pause();
      setActivePlaybackId(null);
    } else {
      audio.play().catch(err => {
        console.error("[drawer] Audio play error:", err, {
          name: err?.name,
          message: err?.message,
          src: audio?.src,
          mediaError: audio?.error,
          errorCode: audio?.error?.code,
          errorMessage: audio?.error?.message,
          networkState: audio?.networkState,
          readyState: audio?.readyState
        });
        toast.error(`Failed to play recording audio (${err?.name || 'Error'}).`);
      });
      setActivePlaybackId(recordingId);
    }
  };

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
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rehearsal Space</h3>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-[250px] md:max-w-[320px]">
                    {songTitle}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close"
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
                  Reference Tracks
                </button>
                <button
                  onClick={() => setActiveTab("recorder")}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
                    activeTab === "recorder"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Voice Recorder
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeTab === "recorder" ? (
                <div className="relative">
                  {/* Blurred overlay wrapper if guest */}
                  <div className={!user ? "blur-[4px] pointer-events-none select-none" : ""}>
                    {/* Sticky Mini-Player Status Bar */}
                    {hasMedia && selectedMedia && (
                      <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 rounded-2xl shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">
                            Reference: {selectedMedia === "youtube" && "YouTube video loaded"}
                            {selectedMedia === "soundcloud" && "SoundCloud track loaded"}
                            {selectedMedia === "spotify" && "Spotify player loaded"}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab("media")}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                        >
                          Control Track
                        </button>
                      </div>
                    )}

                    {/* Audio Recorder Area */}
                    <section className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left">Record New Practice Take</h3>
                        {hasMedia && (
                          <span className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 font-medium">
                            🎧 Wear headphones to prevent bleed
                          </span>
                        )}
                      </div>
                      <AudioRecorder songVersionId={songVersionId} onRecordingSaved={handleRecordingSaved} />
                    </section>

                    {/* Saved Practice Takes List */}
                    <section className="mt-6 space-y-3">
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left">My Recordings</h3>
                      
                      {/* Fake practice takes mock list for guest demo preview */}
                      {!user ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Play className="w-4 h-4 fill-current translate-x-0.5" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Vocal Practice - Guide Take 1</h4>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Jul 1, 2026
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Play className="w-4 h-4 fill-current translate-x-0.5" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Guitar Chords - Run 2</h4>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Jul 1, 2026
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-2">
                          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                          <span className="text-xs text-gray-400">Loading takes...</span>
                        </div>
                      ) : recordings.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                          <p className="text-2xl mb-1">🎤</p>
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">No recordings yet</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] mx-auto">
                            Use the recorder above to capture your chords practice and review it later.
                          </p>
                        </div>
                      ) : (
                        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext
                            items={recordings.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2.5">
                              {recordings.map((rec) => (
                                <SortableRecordingItem
                                  key={rec.id}
                                  rec={rec}
                                  activePlaybackId={activePlaybackId}
                                  deletingId={deletingId}
                                  handleTogglePlay={handleTogglePlay}
                                  handleDelete={handleDelete}
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
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Personal Rehearsal Recorder</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            Sign in to record your own practice takes, save them securely, and listen back anytime.
                          </p>
                        </div>
                        <Link href="/auth/login">
                          <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
                            Sign In to Record
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Media Embed Tab View */
                <div className="space-y-6 text-left">
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
                        title="YouTube video player"
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
              )}

            </div>
          </motion.div>
      {/* Hidden media iframes — always mounted when mini-player is visible */}
      {!isOpen && hasMedia && (
        <div className="absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden" aria-hidden="true">
          {youtubeUrl && selectedMedia === "youtube" && (
            <iframe
              ref={hiddenYoutubeRef}
              width="100%"
              height="100%"
              src={typeof window !== "undefined" && (window as any).__E2E__ ? "about:blank" : getYouTubeEmbedUrl(youtubeUrl)}
              title="YouTube video player (hidden)"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
          {soundcloudUrl && selectedMedia === "soundcloud" && (
            <iframe
              ref={hiddenSoundcloudRef}
              width="100%"
              height="166"
              src={typeof window !== "undefined" && (window as any).__E2E__ ? "about:blank" : `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
              allow="autoplay"
            />
          )}
        </div>
      )}

      {/* Floating Horizontal Bottom Mini Player Widget */}
      {!isOpen && hasMedia && (
        <div 
          data-testid="bottom-mini-player"
          className="fixed bottom-[calc(var(--bottom-nav-height,3.5rem)+env(safe-area-inset-bottom,0px))] lg:bottom-4 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 z-30 w-full lg:max-w-xl lg:rounded-2xl shadow-2xl bg-[#FF5500]/95 backdrop-blur-md text-white h-14 flex items-center justify-between px-4 border-t lg:border border-white/10 select-none animate-in slide-in-from-bottom duration-300"
        >
          {/* Horizontal Progress Bar */}
          <div 
            onClick={handleSliderClickHorizontal}
            className="absolute top-0 inset-x-0 h-1 bg-white/20 cursor-pointer group lg:rounded-t-2xl overflow-hidden"
          >
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${Math.min(100, (mediaCurrentTime / mediaDuration) * 100)}%` }}
            />
            <div 
              className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${Math.min(100, (mediaCurrentTime / mediaDuration) * 100)}% - 6px)` }}
            />
          </div>

          {/* Equalizer & Song Details (Clicking here expands the drawer) */}
          <div 
            onClick={onOpen}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 h-full py-2"
          >
            <div className="flex gap-0.5 items-end h-4 w-4 shrink-0 justify-center">
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${isMediaPlaying ? 'animate-eq-bar-1' : 'h-1.5'}`} />
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${isMediaPlaying ? 'animate-eq-bar-2' : 'h-3'}`} />
              <span className={`w-[2px] bg-white rounded-full transition-all duration-300 ${isMediaPlaying ? 'animate-eq-bar-3' : 'h-2'}`} />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-black truncate">{songTitle}</span>
              <span className="text-[9px] uppercase tracking-widest opacity-80 truncate">
                {playingSource ? (playingSource === 'youtube' ? 'YouTube Reference' : playingSource === 'soundcloud' ? 'SoundCloud Reference' : 'Spotify Reference') : 'Tap to play'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 ml-4 shrink-0">
            {/* Seek Back (only when actively playing) */}
            {playingSource && (
              <button 
                onClick={() => seekRelative(-15)}
                data-testid="mini-seek-back-btn"
                title="Seek 15s backward"
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
              {isMediaPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Seek Forward (only when actively playing) */}
            {playingSource && (
              <button 
                onClick={() => seekRelative(15)}
                data-testid="mini-seek-forward-btn"
                title="Seek 15s forward"
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
              title="Expand Rehearsal Space"
              className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Close/Stop (only when actively playing) */}
            {playingSource && (
              <button 
                onClick={() => {
                  pauseYouTube();
                  pauseSoundCloud();
                  setPlayingSource(null);
                  setIsMediaPlaying(false);
                }}
                data-testid="mini-close-btn"
                title="Stop playback & close player"
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
