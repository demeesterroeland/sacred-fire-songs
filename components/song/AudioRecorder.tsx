"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, CloudUpload, RotateCcw, Upload, FileAudio } from "lucide-react";
import { toast } from "sonner";
import { uploadRehearsalRecording, type UserRecording } from "@/lib/actions/rehearsal";

interface AudioRecorderProps {
  songVersionId: string;
  onRecordingSaved: (recording: UserRecording) => void;
}

export default function AudioRecorder({ songVersionId, onRecordingSaved }: AudioRecorderProps) {
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setAudioUrl(null);
    audioBlobRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioBlobRef.current = audioBlob;
        
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Pre-fill default recording name with timestamp
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        setRecordingName(`Rehearsal - ${dateString} ${timeString}`);
      };

      mediaRecorder.start(200); // chunk chunks every 200ms
      setRecordingState("recording");
      setDuration(0);

      const timerIntervalMs = typeof window !== "undefined" && (window as any).__E2E_FAST_TIMER__ ? 10 : 1000;

      // Start timer with 3-minute limit check (180 seconds)
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev + 1 >= 180) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimeout(() => {
              stopRecording();
              toast.info("Recording automatically stopped at the 3-minute limit.");
            }, 0);
            return 180;
          }
          return prev + 1;
        });
      }, timerIntervalMs);
    } catch (err: any) {
      console.error("[recorder] Microphone access failed:", err);
      setErrorMsg("Failed to access microphone. Please check your permissions.");
      setRecordingState("idle");
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      const timerIntervalMs = typeof window !== "undefined" && (window as any).__E2E_FAST_TIMER__ ? 10 : 1000;

      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev + 1 >= 180) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimeout(() => {
              stopRecording();
              toast.info("Recording automatically stopped at the 3-minute limit.");
            }, 0);
            return 180;
          }
          return prev + 1;
        });
      }, timerIntervalMs);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Discard recording / uploaded file
  const discardRecording = () => {
    setRecordingState("idle");
    setDuration(0);
    setAudioUrl(null);
    audioBlobRef.current = null;
    setRecordingName("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Handle local file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Limit to 25 MB for uploaded files
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("Audio file size exceeds the 25 MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    audioBlobRef.current = file;
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);
    setRecordingState("stopped");

    // Clean up filename for default title (strip extension)
    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    setRecordingName(defaultName || `Rehearsal - ${new Date().toLocaleDateString()}`);
  };

  // Upload/Save recording or file
  const saveRecording = async () => {
    if (!audioBlobRef.current) return;
    setIsUploading(true);
    setErrorMsg(null);

    const maxLimit = activeTab === "upload" ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (audioBlobRef.current.size > maxLimit) {
      setErrorMsg(`File size exceeds the ${activeTab === "upload" ? "25 MB" : "10 MB"} limit.`);
      setIsUploading(false);
      return;
    }

    try {
      const { recording, error } = await uploadRehearsalRecording(
        songVersionId,
        recordingName.trim(),
        audioBlobRef.current
      );

      if (recording) {
        onRecordingSaved(recording);
        discardRecording();
      } else {
        setErrorMsg(error || "Failed to save recording to storage server. Please try again.");
      }
    } catch (err: any) {
      console.error("[recorder] Upload error:", err);
      const msg = typeof err === 'string' ? err : (err?.message || err?.error_description || JSON.stringify(err));
      setErrorMsg(msg && msg !== '{}' ? msg : "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full p-6 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center space-y-4 transition-all duration-300">
      
      {/* Record / Upload Tab Toggle (only shown when idle) */}
      {recordingState === "idle" && (
        <div className="flex bg-gray-200/60 dark:bg-gray-800/60 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab("record"); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "record"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Record Audio
          </button>
          <button
            onClick={() => { setActiveTab("upload"); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      )}

      {/* Mode: Record View */}
      {activeTab === "record" && (
        <>
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Mic className={`w-4 h-4 ${recordingState === 'recording' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            {recordingState === "idle" && "Ready to record rehearsal"}
            {recordingState === "recording" && "Recording rehearsal..."}
            {recordingState === "paused" && "Recording paused"}
            {recordingState === "stopped" && "Review your recording"}
          </h4>

          {/* Timer */}
          <div className="text-3xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
            {formatTime(duration)}
          </div>
        </>
      )}

      {/* Mode: Upload View (when idle) */}
      {activeTab === "upload" && recordingState === "idle" && (
        <div className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all group cursor-pointer text-center"
             onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.opus,.flac,.aac"
            className="hidden"
          />
          <div className="p-3 rounded-full bg-violet-500/10 text-violet-500 mb-2 group-hover:scale-110 transition-transform">
            <FileAudio className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Click to select an audio file
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[240px] leading-tight">
            Supports MP3, M4A, OPUS, FLAC, WAV, OGG, WEBM (Max 25 MB)
          </p>
        </div>
      )}

      {/* Local preview audio player (shown for both recorded and uploaded files once stopped/selected) */}
      {audioUrl && recordingState === "stopped" && (
        <div className="w-full flex flex-col items-center space-y-2 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <FileAudio className="w-3.5 h-3.5 text-violet-400" /> Preview Rehearsal Audio
          </p>
          <audio src={audioUrl} controls className="w-full max-w-md h-10 accent-indigo-500 rounded-lg" />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center w-full">
          {errorMsg}
        </div>
      )}

      {/* Inputs for saving */}
      {recordingState === "stopped" && (
        <div className="w-full space-y-3">
          <input
            type="text"
            placeholder="Recording Name (e.g. Rehearsal 1)"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-black text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
          />
          
          <div className="flex gap-3 w-full">
            <button
              onClick={discardRecording}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              Discard
            </button>
            
            <button
              onClick={saveRecording}
              disabled={isUploading || !recordingName.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              Save Rehearsal
            </button>
          </div>
        </div>
      )}

      {/* Recording Control Buttons (Record tab only) */}
      {activeTab === "record" && recordingState !== "stopped" && (
        <div className="flex items-center justify-center gap-6 py-2">
          
          {/* Discard Button (visible only when recording/paused) */}
          {(recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={discardRecording}
              className="p-3 rounded-full border border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 active:scale-95"
              title="Cancel and discard"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          {/* Core Action Button (Record / Pause / Play) */}
          {recordingState === "idle" && (
            <button
              onClick={startRecording}
              className="relative p-5 rounded-full bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25 transition-all duration-300 active:scale-95 group"
              title="Start recording"
            >
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 group-hover:scale-105 duration-1000" />
              <Mic className="w-6 h-6 relative z-10" />
            </button>
          )}

          {recordingState === "recording" && (
            <button
              onClick={pauseRecording}
              className="p-5 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 active:scale-95"
              title="Pause recording"
            >
              <Pause className="w-6 h-6" />
            </button>
          )}

          {recordingState === "paused" && (
            <button
              onClick={resumeRecording}
              className="p-5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-95"
              title="Resume recording"
            >
              <Play className="w-6 h-6" />
            </button>
          )}

          {/* Stop Button (visible when recording/paused) */}
          {(recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={stopRecording}
              className="p-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md transition-all duration-300 active:scale-95"
              title="Stop recording"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          )}

        </div>
      )}

    </div>
  );
}
