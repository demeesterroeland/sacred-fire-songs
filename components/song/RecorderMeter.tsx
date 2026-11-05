"use client";

import { useLocale } from "@/context/LocaleContext";
import { useInputLevel } from "@/lib/recorder/useInputLevel";

/** Level meter bar height range in px (bar length carries the level, not colour). */
const BAR_MIN_PX = 8;
const BAR_MAX_PX = 32;

interface RecorderMeterProps {
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  /** True while the 3-2-1 count-in runs. */
  countingIn: boolean;
  recordingState: "idle" | "recording" | "paused" | "stopped";
}

/**
 * Input level meter and the "no sound yet" hint of the Practice recorder
 * (Story 6.1.20 / G4.7, #404). It owns the level hook, so its ~20 redraws a
 * second stay out of the rest of the recorder. Bar height is the level and the
 * hint is in words: colour never carries the meaning. The hint's live region is
 * always mounted (empty) so screen readers announce the text when it fills in.
 */
export default function RecorderMeter({ stream, audioContext, countingIn, recordingState }: RecorderMeterProps) {
  const { t } = useLocale();
  // The meter listens while the count-in runs and while recording; paused reads 0.
  const listening = countingIn || recordingState === "recording";
  const { level, levels, silent } = useInputLevel(stream, audioContext, listening, recordingState === "recording");
  const live = listening || recordingState === "paused";
  const showHint = silent && recordingState === "recording";

  return (
    <div className="flex flex-col items-center">
      {live ? (
        <div
          role="meter"
          aria-label={t('recorder.meter.label')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(level * 100)}
          data-testid="recorder-level-meter"
          data-level={Math.round(level * 100)}
          className="flex h-8 items-end justify-center gap-1"
        >
          {levels.map((l, i) => (
            <span
              key={i}
              data-bar
              aria-hidden="true"
              className={`w-1.5 rounded-pill ${recordingState === "recording" ? "bg-accent" : "bg-fg-subtle"}`}
              style={{ height: `${Math.round(BAR_MIN_PX + l * (BAR_MAX_PX - BAR_MIN_PX))}px` }}
            />
          ))}
        </div>
      ) : (
        <div className="h-8" aria-hidden="true" />
      )}

      <p
        role="status"
        data-testid="recorder-silent-hint"
        className={showHint ? "mt-2 max-w-xs text-center text-caption text-fg-muted" : undefined}
      >
        {showHint ? t('recorder.meter.silent') : null}
      </p>
    </div>
  );
}
