"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Trash2, Calendar, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import AudioRecorder from "./AudioRecorder";
import { getUserRecordings, deleteUserRecording, type UserRecording } from "@/lib/actions/rehearsal";

interface RehearsalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songVersionId: string;
  songTitle: string;
  songAuthor: string;
}

export default function RehearsalDrawer({
  isOpen,
  onClose,
  songVersionId,
  songTitle,
  songAuthor,
}: RehearsalDrawerProps) {
  const [recordings, setRecordings] = useState<UserRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle new recording saved
  const handleRecordingSaved = (newRecording: UserRecording) => {
    setRecordings((prev) => [newRecording, ...prev]);
    toast.success("Rehearsal recording saved successfully!");
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
    if (!audioUrl) {
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
      setAudioElements(prev => ({ ...prev, [recordingId]: audio }));
    }

    if (activePlaybackId === recordingId) {
      audio.pause();
      setActivePlaybackId(null);
    } else {
      audio.play().catch(err => {
        console.error("[drawer] Audio play error:", err);
        toast.error("Failed to play recording audio.");
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Bottom Drawer Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
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

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Audio Recorder Area */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left">Record New Practice Take</h3>
                <AudioRecorder songVersionId={songVersionId} onRecordingSaved={handleRecordingSaved} />
              </section>

              {/* Saved Practice Takes List */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left">My Saved Takes</h3>
                
                {isLoading ? (
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
                  <div className="space-y-2.5">
                    {recordings.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                      >
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
                    ))}
                  </div>
                )}
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
