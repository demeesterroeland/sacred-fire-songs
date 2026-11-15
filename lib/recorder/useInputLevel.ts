"use client";

import { useEffect, useRef, useState } from "react";
import {
  LEVEL_BARS,
  isSilentLongEnough,
  nextSilentMs,
  pushLevel,
  rmsFromBytes,
  rmsToLevel,
} from "@/lib/recorder/recorderMath";

/** The meter redraws about 20 times a second: smooth enough, cheap on phones. */
const FRAME_MS = 50;
const SILENT_BARS: readonly number[] = Object.freeze(new Array(LEVEL_BARS).fill(0));

type AudioContextCtor = typeof AudioContext;

/**
 * Create and resume ONE AudioContext for a take. Call it synchronously inside the tap
 * that starts recording (before any `await`): iOS Safari only lets a context run when
 * it is started from a user gesture. Returns null without Web Audio.
 */
export function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    const ctx = new Ctor();
    Promise.resolve(ctx.resume?.()).catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

export interface InputLevel {
  /** Current input level, 0..1. */
  level: number;
  /** The last LEVEL_BARS levels, oldest first (the bars of the meter). */
  levels: readonly number[];
  /** True when the last 3 s of recording had no sound (a rolling window, not a latch). */
  silent: boolean;
}

/**
 * Input level of a microphone stream (Story 6.1.20 / G4.7, #404): a Web Audio
 * `AnalyserNode` on the caller's shared `audioContext` is read with
 * `requestAnimationFrame`. The source is never connected to the speakers, so
 * there is no echo, and the context is never closed here (its owner closes it
 * once per take). While `active` is false (for example paused) or without Web
 * Audio, the meter reads 0 and `silent` is false. `countSilence` is true only
 * while recording, so the count-in never counts towards the silence window.
 */
export function useInputLevel(
  stream: MediaStream | null,
  audioContext: AudioContext | null,
  active: boolean,
  countSilence: boolean,
): InputLevel {
  const [reading, setReading] = useState<InputLevel>({ level: 0, levels: SILENT_BARS, silent: false });
  const countSilenceRef = useRef(countSilence);

  useEffect(() => {
    countSilenceRef.current = countSilence;
  }, [countSilence]);

  useEffect(() => {
    if (!stream || !audioContext || !active) return;

    let source: MediaStreamAudioSourceNode | undefined;
    let analyser: AnalyserNode;
    try {
      source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
    } catch {
      source?.disconnect();
      return; // flat meter; the take itself is unaffected
    }
    const buffer = new Uint8Array(analyser.fftSize);

    let frame = 0;
    let last = -Infinity;
    let silentMs = 0;
    let history: readonly number[] = SILENT_BARS;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const gap = last === -Infinity ? 0 : now - last;
      last = now;
      analyser.getByteTimeDomainData(buffer);
      const level = rmsToLevel(rmsFromBytes(buffer));
      history = pushLevel(history, level);
      silentMs = nextSilentMs(silentMs, level, gap, countSilenceRef.current);
      setReading({ level, levels: history, silent: isSilentLongEnough(silentMs) });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      source?.disconnect();
    };
  }, [stream, audioContext, active]);

  if (!stream || !audioContext || !active) return { level: 0, levels: SILENT_BARS, silent: false };
  return reading;
}
