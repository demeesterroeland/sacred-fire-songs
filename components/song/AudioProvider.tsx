'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { type UserRecording } from "@/lib/actions/rehearsal";

interface AudioContextType {
  activePlaybackId: string | null;
  activeRecording: UserRecording | null;
  audioElements: Record<string, HTMLAudioElement>;
  isRecordingPlaying: boolean;
  recordingCurrentTime: number;
  recordingDuration: number;
  handleTogglePlay: (recording: UserRecording, audioUrl: string | undefined) => void;
  pauseActiveRecording: () => void;
  stopActiveRecording: () => void;
  seekActiveRecording: (time: number) => void;
  seekRelativeActiveRecording: (seconds: number) => void;
  clearAudioElements: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [activeRecording, setActiveRecording] = useState<UserRecording | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  
  const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
  const [recordingCurrentTime, setRecordingCurrentTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(1);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const clearAudioElements = () => {
    Object.values(audioElements).forEach(audio => {
      audio.pause();
    });
    setAudioElements({});
    setActivePlaybackId(null);
    setActiveRecording(null);
    setIsRecordingPlaying(false);
  };

  const handleTogglePlay = (recording: UserRecording, audioUrl: string | undefined) => {
    const recordingId = recording.id;
    console.log("[AudioProvider] handleTogglePlay invoked:", {
      recordingId,
      audioUrl,
      recordingName: recording.recording_name,
    });

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

      const rawExt = recording.storage_path ? recording.storage_path.split('.').pop()?.toLowerCase() : 'unknown';
      let mimeCheck = 'audio/webm';
      if (rawExt === 'm4a' || rawExt === 'mp4') mimeCheck = 'audio/mp4';
      else if (rawExt === 'mp3') mimeCheck = 'audio/mpeg';
      else if (rawExt === 'ogg') mimeCheck = 'audio/ogg';
      else if (rawExt === 'wav') mimeCheck = 'audio/wav';

      const canPlay = audio.canPlayType(mimeCheck);
      console.log(`[AudioProvider] FORMAT CHECK: File extension = .${rawExt}, Mime check = ${mimeCheck}, Browser canPlayType = "${canPlay || 'no'}"`);

      audio.onplay = () => {
        setIsRecordingPlaying(true);
      };

      audio.onplaying = () => {
        setIsRecordingPlaying(true);
        setRecordingDuration(audio.duration);
      };

      audio.onpause = () => {
        setIsRecordingPlaying(false);
      };

      audio.onended = () => {
        setIsRecordingPlaying(false);
      };

      audio.ontimeupdate = () => {
        setRecordingCurrentTime(audio.currentTime);
      };
      
      audio.onloadedmetadata = () => {
        setRecordingDuration(audio.duration || 1);
      };

      audio.onerror = (e) => {
        const mediaError = audio.error;
        let errorReason = "UNKNOWN_ERROR";
        if (mediaError?.code === 1) errorReason = "MEDIA_ERR_ABORTED";
        else if (mediaError?.code === 2) errorReason = "MEDIA_ERR_NETWORK";
        else if (mediaError?.code === 3) errorReason = "MEDIA_ERR_DECODE";
        else if (mediaError?.code === 4) errorReason = "MEDIA_ERR_SRC_NOT_SUPPORTED";

        console.error(`[AudioProvider] PLAYBACK UNSUCCESSFUL`, {
          event: e,
          errorCode: mediaError?.code,
          errorReason,
          src: audio.src,
        });
      };

      setAudioElements(prev => ({ ...prev, [recordingId]: audio }));
    }

    setActiveRecording(recording);

    if (activePlaybackId === recordingId) {
      if (audio.paused) {
        audio.play().catch(console.error);
        setActivePlaybackId(recordingId);
        activeAudioRef.current = audio;
      } else {
        audio.pause();
        // We do NOT clear activePlaybackId here so the MiniPlayer stays on the recording
      }
    } else {
      audio.play().catch(console.error);
      setActivePlaybackId(recordingId);
      activeAudioRef.current = audio;
    }
  };

  const pauseActiveRecording = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
  };

  const stopActiveRecording = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      setActivePlaybackId(null);
      setActiveRecording(null);
    }
  };

  const seekActiveRecording = (time: number) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.currentTime = time;
      setRecordingCurrentTime(time);
    }
  };

  const seekRelativeActiveRecording = (seconds: number) => {
    if (activeAudioRef.current) {
      let target = activeAudioRef.current.currentTime + seconds;
      target = Math.max(0, Math.min(recordingDuration, target));
      activeAudioRef.current.currentTime = target;
      setRecordingCurrentTime(target);
    }
  };

  return (
    <AudioContext.Provider value={{
      activePlaybackId,
      activeRecording,
      audioElements,
      isRecordingPlaying,
      recordingCurrentTime,
      recordingDuration,
      handleTogglePlay,
      pauseActiveRecording,
      stopActiveRecording,
      seekActiveRecording,
      seekRelativeActiveRecording,
      clearAudioElements,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
