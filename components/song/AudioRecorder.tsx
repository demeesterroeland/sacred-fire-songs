"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, CloudUpload, Upload, FileAudio } from "lucide-react";
import { toast } from "sonner";
import { uploadRehearsalRecording, type UserRecording } from "@/lib/actions/rehearsal";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import RecorderMeter from "@/components/song/RecorderMeter";
import { createAudioContext } from "@/lib/recorder/useInputLevel";
import {
  MAX_RECORDING_SECONDS,
  countInSequence,
  formatClock,
  formatRemaining,
  isRemainingVisible,
  remainingSeconds,
} from "@/lib/recorder/recorderMath";

interface AudioRecorderProps {
  songVersionId: string;
  onRecordingSaved: (recording: UserRecording) => void;
}

/** Remembers the count-in choice on this device (a convenience, never required). */
const COUNT_IN_STORAGE_KEY = "sfs:recorder:count-in";

/** Count-in is on unless this device chose "off" (the recorder only mounts on the client, in the Practice drawer). */
function readCountInPreference(): boolean {
  try {
    return window.localStorage.getItem(COUNT_IN_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export default function AudioRecorder({ songVersionId, onRecordingSaved }: AudioRecorderProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countInEnabled, setCountInEnabled] = useState(readCountInPreference);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  // One AudioContext per take, created in the tap (iOS) and shared with the level meter.
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const startingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const unmountedRef = useRef(false);

  const toggleCountIn = (enabled: boolean) => {
    setCountInEnabled(enabled);
    try {
      window.localStorage.setItem(COUNT_IN_STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      /* storage blocked: the choice only lasts for this visit */
    }
  };

  // Turn the microphone off and close the take's audio context.
  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    closeAudioContext();
  };

  const closeAudioContext = () => {
    const ctx = audioContextRef.current;
    audioContextRef.current = null;
    setAudioContext(null);
    if (ctx) Promise.resolve(ctx.close?.()).catch(() => {});
  };

  // Show a take's blob URL, revoking the previous one.
  const replaceAudioUrl = (url: string | null) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = url;
    setAudioUrl(url);
  };

  // Stop listening to the recorder without letting a late `onstop` refill the take.
  const detachRecorder = () => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (!recorder) return;
    recorder.onstop = null;
    recorder.ondataavailable = null;
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch {
      /* already stopped */
    }
  };

  // One second per tick; the e2e flag makes it 100x faster.
  const startTimer = () => {
    const timerIntervalMs = typeof window !== "undefined" && (window as unknown as { __E2E_FAST_TIMER__?: boolean }).__E2E_FAST_TIMER__ ? 10 : 1000;
    timerIntervalRef.current = setInterval(() => {
      setDuration((prev) => {
        if (prev + 1 >= MAX_RECORDING_SECONDS) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimeout(() => {
            stopRecording();
            toast.info(t('rehearsal.recording.autoStopped'));
          }, 0);
          return MAX_RECORDING_SECONDS;
        }
        return prev + 1;
      });
    }, timerIntervalMs);
  };

  // Start capturing from a warm microphone.
  const beginCapture = (activeStream: MediaStream) => {
    let options = {};
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      options = { mimeType: "audio/webm" };
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      options = { mimeType: "audio/mp4" };
    }

    const mediaRecorder = new MediaRecorder(activeStream, options);
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

      replaceAudioUrl(URL.createObjectURL(audioBlob));

      // Pre-fill default recording name with timestamp
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
      setRecordingName(t('recorder.defaultName', { date: dateString, time: timeString }));
    };

    mediaRecorder.start(200); // chunk chunks every 200ms
    setRecordingState("recording");
    setDuration(0);
    startTimer();
  };

  // The microphone was granted but capturing could not start (or access failed): back to idle, mic off.
  const failStart = (err: unknown) => {
    console.error("[recorder] Microphone access failed:", err);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    detachRecorder();
    releaseStream();
    setErrorMsg(t('recorder.error.micAccess'));
    setRecordingState("idle");
    setCountdown(null);
  };

  // Start recording
  const startRecording = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setErrorMsg(null);
    audioChunksRef.current = [];
    replaceAudioUrl(null);
    audioBlobRef.current = null;

    // The audio context must start inside this tap (before any await) or iOS keeps it suspended.
    closeAudioContext();
    const ctx = createAudioContext();
    audioContextRef.current = ctx;
    setAudioContext(ctx);

    try {
      // 1. Ask for the microphone and power it up (this causes the hardware pop).
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (unmountedRef.current) {
        // The recorder closed while the permission prompt was open: do not leave the microphone on.
        micStream.getTracks().forEach((track) => track.stop());
        closeAudioContext();
        return;
      }
      streamRef.current = micStream;
      setStream(micStream);
      // iOS can suspend the context when the audio session switches to recording; it was
      // started inside the tap, so resuming again here is allowed.
      if (ctx?.state === 'suspended' && typeof ctx.resume === 'function') void ctx.resume().catch(() => {});

      // 2. Optional 3-2-1 count-in; the microphone stays warm and the meter already moves.
      const sequence = countInSequence(countInEnabled);
      if (sequence.length === 0) {
        beginCapture(micStream);
        return;
      }
      let step = 0;
      setCountdown(sequence[0]);
      countdownIntervalRef.current = setInterval(() => {
        step += 1;
        if (step < sequence.length) {
          setCountdown(sequence[step]);
          return;
        }
        // 3. Count-in finished: start capturing.
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        try {
          beginCapture(micStream);
        } catch (err) {
          failStart(err);
        }
      }, 1000);
    } catch (err) {
      failStart(err);
    } finally {
      startingRef.current = false;
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
      startTimer();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      releaseStream();
    }
  };

  // Discard recording / uploaded file
  const discardRecording = () => {
    setRecordingState("idle");
    setCountdown(null);
    setDuration(0);
    replaceAudioUrl(null);
    audioBlobRef.current = null;
    setRecordingName("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Detach first: a late onstop must not refill the take we just threw away.
    detachRecorder();
    releaseStream();
  };

  // Handle local file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Limit to 25 MB for uploaded files
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(t('recorder.error.size25mb'));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    audioBlobRef.current = file;
    const localUrl = URL.createObjectURL(file);
    replaceAudioUrl(localUrl);
    setRecordingState("stopped");

    // Extract duration from uploaded file
    const tempAudio = new Audio(localUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && tempAudio.duration !== Infinity) {
        setDuration(Math.round(tempAudio.duration));
      }
    };

    // Clean up filename for default title (strip extension)
    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    setRecordingName(defaultName || t('recorder.defaultUploadName', { date: new Date().toLocaleDateString() }));
  };

  // Upload/Save recording or file
  const saveRecording = async () => {
    if (!audioBlobRef.current) return;
    setIsUploading(true);
    setErrorMsg(null);

    const maxLimit = activeTab === "upload" ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (audioBlobRef.current.size > maxLimit) {
      setErrorMsg(t('recorder.error.fileSizeLimit', { limit: activeTab === "upload" ? "25 MB" : "10 MB" }));
      setIsUploading(false);
      return;
    }

    try {
      const { recording, error } = await uploadRehearsalRecording(
        songVersionId,
        recordingName.trim(),
        audioBlobRef.current,
        duration
      );

      if (recording) {
        onRecordingSaved(recording);
        discardRecording();
      } else {
        setErrorMsg(error || t('recorder.error.saveFailed'));
      }
    } catch (err) {
      console.error("[recorder] Upload error:", err);
      const e = err as { message?: string; error_description?: string } | null;
      const msg = typeof err === 'string' ? err : (e?.message || e?.error_description || JSON.stringify(err));
      setErrorMsg(msg && msg !== '{}' ? msg : t('recorder.error.unexpected'));
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const ctx = audioContextRef.current;
      if (ctx) Promise.resolve(ctx.close?.()).catch(() => {});
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const remaining = remainingSeconds(duration);
  const showRemaining = (recordingState === "recording" || recordingState === "paused") && isRemainingVisible(duration);
  const isRecordView = activeTab === "record";
  const showMeter = isRecordView && recordingState !== "stopped";

  const tabClass = (selected: boolean) =>
    `flex min-h-tap items-center gap-1.5 rounded-control px-4 text-meta font-semibold transition-colors ${
      selected ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
    }`;

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 rounded-panel border border-line bg-surface p-4">

      {/* Record / Upload Tab Toggle (only shown when idle) */}
      {recordingState === "idle" && countdown === null && (
        <div className="flex gap-1 rounded-control bg-surface-2 p-1" role="group">
          <button
            onClick={() => { setActiveTab("record"); setErrorMsg(null); }}
            aria-pressed={activeTab === "record"}
            className={tabClass(activeTab === "record")}
          >
            <Mic className="size-4" />
            {t('recorder.tab.recordAudio')}
          </button>
          <button
            onClick={() => { setActiveTab("upload"); setErrorMsg(null); }}
            aria-pressed={activeTab === "upload"}
            className={tabClass(activeTab === "upload")}
          >
            <Upload className="size-4" />
            {t('recorder.tab.upload')}
          </button>
        </div>
      )}

      {/* Mode: Record View */}
      {isRecordView && (
        <>
          {/* Title */}
          <h4 className="flex items-center gap-2 text-meta font-semibold text-fg">
            <Mic className={`size-4 ${recordingState === "recording" ? "text-danger motion-safe:animate-pulse" : "text-fg-subtle"}`} />
            {recordingState === "idle" && t('recorder.state.idle')}
            {recordingState === "recording" && t('recorder.state.recording')}
            {recordingState === "paused" && t('recorder.state.paused')}
            {recordingState === "stopped" && t('recorder.state.stopped')}
          </h4>

          {/* Timer */}
          <div className="font-mono text-display font-bold tracking-tight text-fg">
            {formatClock(duration)}
          </div>

          {/* Count-in step (a live region that is always mounted, empty until the count-in), time left in the last minute, or the limit: always in words */}
          <div className="flex flex-col items-center">
            <p role="status" className="text-meta font-semibold text-fg">
              {countdown !== null ? t('recorder.countIn.status', { n: countdown }) : null}
            </p>
            {countdown === null && showRemaining ? (
              <p
                className={`text-meta ${remaining <= 10 ? "font-bold text-danger" : "font-semibold text-fg"}`}
                data-testid="recorder-time-left"
              >
                {t('recorder.timeLeft', { time: formatRemaining(remaining) })}
              </p>
            ) : countdown === null && recordingState !== "stopped" ? (
              <p className="text-caption text-fg-muted">{t('recorder.limit')}</p>
            ) : null}
          </div>

          {/* Input level meter + no-sound hint (its own component: the level redraws 20x a second) */}
          {showMeter && (
            <RecorderMeter
              stream={stream}
              audioContext={audioContext}
              countingIn={countdown !== null}
              recordingState={recordingState}
            />
          )}

          {/* Count-in toggle (idle only) */}
          {recordingState === "idle" && countdown === null && (
            <label className="flex min-h-tap cursor-pointer items-center gap-3 text-meta text-fg">
              <input
                type="checkbox"
                role="switch"
                checked={countInEnabled}
                onChange={(e) => toggleCountIn(e.target.checked)}
                className="size-5 accent-accent"
              />
              {t('recorder.countIn.label')}
            </label>
          )}
        </>
      )}

      {/* Mode: Upload View (when idle) */}
      {activeTab === "upload" && recordingState === "idle" && (
        <div
          className="group flex min-h-tap w-full cursor-pointer flex-col items-center justify-center rounded-panel border-2 border-dashed border-line-strong px-4 py-4 text-center transition-colors hover:bg-surface-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.opus,.flac,.aac"
            className="hidden"
          />
          <div className="mb-2 rounded-pill bg-accent-soft p-3 text-accent">
            <FileAudio className="size-6" />
          </div>
          <p className="text-meta font-semibold text-fg">
            {t('recorder.upload.heading')}
          </p>
          <p className="mt-1 max-w-[240px] text-caption leading-tight text-fg-muted">
            {t('recorder.upload.formats')}
          </p>
        </div>
      )}

      {/* Local preview audio player (shown for both recorded and uploaded files once stopped/selected) */}
      {audioUrl && recordingState === "stopped" && (
        <div className="flex w-full flex-col items-center space-y-2 py-2">
          <p className="flex items-center gap-1.5 text-meta text-fg-muted">
            <FileAudio className="size-4 text-fg-subtle" /> {t('recorder.preview')}
          </p>
          <audio src={audioUrl} controls className="h-11 w-full max-w-md rounded-control accent-accent" />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div role="alert" className="w-full rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-center text-meta text-danger">
          {errorMsg}
        </div>
      )}

      {/* Review step: Save is the single primary, Discard a text button below it */}
      {recordingState === "stopped" && (
        <div className="w-full space-y-3">
          <input
            type="text"
            placeholder={t('recorder.name.placeholder')}
            aria-label={t('recorder.name.placeholder')}
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            disabled={isUploading}
            className="min-h-tap w-full rounded-control border border-line-strong bg-bg px-4 text-body text-fg focus:outline-2 focus:outline-offset-2 focus:outline-focus"
          />

          <div className="flex w-full flex-col gap-1">
            <Button
              variant="primary"
              size="lg"
              onClick={saveRecording}
              disabled={isUploading || !recordingName.trim()}
              className="min-h-tap w-full"
            >
              {isUploading ? (
                <div className="size-4 rounded-pill border-2 border-on-accent/30 border-t-on-accent motion-safe:animate-spin" />
              ) : (
                <CloudUpload />
              )}
              {t('recorder.btn.save')}
            </Button>
            <Button
              variant="ghost"
              onClick={discardRecording}
              disabled={isUploading}
              className="min-h-tap w-full text-fg-muted"
            >
              {t('recorder.btn.discard')}
            </Button>
          </div>
        </div>
      )}

      {/* Recording Control Buttons (Record tab only) */}
      {isRecordView && recordingState !== "stopped" && (
        <div className="flex items-center justify-center gap-6 py-2">

          {/* Cancel / discard (visible during the count-in, recording and paused) */}
          {(countdown !== null || recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={discardRecording}
              className="flex size-tap items-center justify-center rounded-pill border border-line-strong text-fg-muted transition-colors hover:bg-surface-2 motion-safe:active:scale-95"
              title={t('recorder.btn.cancel')}
              aria-label={t('recorder.btn.cancel')}
            >
              <Trash2 className="size-5" />
            </button>
          )}

          {/* Core Action Button (Record / Pause / Resume) */}
          {recordingState === "idle" && (
            <button
              onClick={countdown !== null ? undefined : startRecording}
              disabled={countdown !== null}
              className={`relative flex size-16 items-center justify-center rounded-pill bg-accent text-on-accent shadow-sheet transition-colors ${countdown !== null ? "cursor-default" : "hover:bg-accent/90 motion-safe:active:scale-95"}`}
              title={t('recorder.btn.start')}
              aria-label={t('recorder.btn.start')}
            >
              {countdown !== null ? (
                <span aria-hidden="true" className="relative z-10 flex size-6 items-center justify-center text-title font-bold">
                  {countdown}
                </span>
              ) : (
                <Mic className="relative z-10 size-6" />
              )}
            </button>
          )}

          {recordingState === "recording" && (
            <button
              onClick={pauseRecording}
              className="flex size-16 items-center justify-center rounded-pill border border-line-strong bg-surface-2 text-fg transition-colors hover:bg-surface-2/80 motion-safe:active:scale-95"
              title={t('recorder.btn.pause')}
              aria-label={t('recorder.btn.pause')}
            >
              <Pause className="size-6" />
            </button>
          )}

          {recordingState === "paused" && (
            <button
              onClick={resumeRecording}
              className="flex size-16 items-center justify-center rounded-pill bg-accent text-on-accent transition-colors hover:bg-accent/90 motion-safe:active:scale-95"
              title={t('recorder.btn.resume')}
              aria-label={t('recorder.btn.resume')}
            >
              <Play className="size-6" />
            </button>
          )}

          {/* Stop Button (visible when recording/paused) */}
          {(recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={stopRecording}
              className="flex size-tap items-center justify-center rounded-pill bg-danger text-on-danger transition-colors hover:bg-danger/90 motion-safe:active:scale-95"
              title={t('recorder.btn.stop')}
              aria-label={t('recorder.btn.stop')}
            >
              <Square className="size-5 fill-current" />
            </button>
          )}

        </div>
      )}

    </div>
  );
}
