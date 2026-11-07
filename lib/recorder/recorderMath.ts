/**
 * Pure helpers for the Practice recorder (Story 6.1.20 / G4.7, #404):
 * remaining time, count-in sequence and the input level meter. No React, no
 * browser APIs, so they are unit-tested in plain Vitest.
 */

/** A take stops by itself after 3 minutes. */
export const MAX_RECORDING_SECONDS = 180;
/** "m:ss left" shows in the last minute. */
export const REMAINING_VISIBLE_FROM_SECONDS = 60;
/** The optional count-in is 3-2-1. */
export const COUNT_IN_SECONDS = 3;
/** Bars in the level meter (a rolling history of the last levels). */
export const LEVEL_BARS = 8;
/** Level (0..1) above which the microphone counts as "heard". About -51 dB. */
export const SOUND_THRESHOLD = 0.15;
/** The "no sound yet" hint appears after this many seconds of silence while recording (a rolling window). */
export const SILENT_HINT_AFTER_SECONDS = 3;
/** A gap between two meter frames counts for at most this long (a background tab must not trigger the hint). */
export const MAX_FRAME_GAP_MS = 250;
/** dB floor of the meter: -60 dB and below reads as silence. */
const MIN_DB = -60;

/** Seconds left of the 3-minute limit, never below zero. */
export function remainingSeconds(elapsed: number): number {
  return Math.max(0, MAX_RECORDING_SECONDS - Math.max(0, elapsed));
}

/** True from the last minute on (elapsed 2:00 → "1:00 left"). */
export function isRemainingVisible(elapsed: number): boolean {
  return remainingSeconds(elapsed) <= REMAINING_VISIBLE_FROM_SECONDS;
}

/** m:ss, minutes without a leading zero ("2:41", "0:09"). */
export function formatRemaining(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** mm:ss elapsed clock ("03:00"). */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** The numbers the count-in shows, one per second; empty when the count-in is off. */
export function countInSequence(enabled: boolean): number[] {
  return enabled ? Array.from({ length: COUNT_IN_SECONDS }, (_, i) => COUNT_IN_SECONDS - i) : [];
}

/** RMS (0..1) of an AnalyserNode time-domain byte buffer (128 = silence). */
export function rmsFromBytes(bytes: ArrayLike<number>): number {
  if (bytes.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < bytes.length; i++) {
    const v = (bytes[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / bytes.length);
}

/** RMS (0..1) → meter level (0..1) on a dB scale, -60 dB … 0 dB. */
export function rmsToLevel(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  return Math.min(1, Math.max(0, (db - MIN_DB) / -MIN_DB));
}

/** Drop the oldest level, append the newest; the history keeps LEVEL_BARS entries. */
export function pushLevel(history: readonly number[], level: number): number[] {
  return [...history, level].slice(-LEVEL_BARS);
}

/**
 * Milliseconds of unbroken silence so far. Sound above the threshold resets it; it only
 * grows while `counting` (recording, not the count-in), by the frame gap capped at MAX_FRAME_GAP_MS.
 */
export function nextSilentMs(previous: number, level: number, frameGapMs: number, counting: boolean): number {
  if (!counting || level > SOUND_THRESHOLD) return 0;
  return previous + Math.min(MAX_FRAME_GAP_MS, Math.max(0, frameGapMs));
}

/** "We hear nothing": the last SILENT_HINT_AFTER_SECONDS of recording had no sound. */
export function isSilentLongEnough(silentMs: number): boolean {
  return silentMs >= SILENT_HINT_AFTER_SECONDS * 1000;
}
