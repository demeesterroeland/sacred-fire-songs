"use client";

import Link from "next/link";
import { ChevronRight, Pause, Play } from "lucide-react";
import { ListRow } from "@/components/ui/list-row";
import { useAudio } from "@/components/song/AudioProvider";
import { useLocale } from "@/context/LocaleContext";
import { LOCALE_DATE_TAGS } from "@/lib/i18n";
import { recordingPermalink } from "@/lib/songs/recordingLink";
import { toPlayableRecording, type ProfileRecording } from "@/lib/users/profileRecordings";
import { cn } from "@/lib/utils";

/**
 * One recording on a singer profile (#490): ▶/❚❚ plays it here through the shared
 * audio player (one recording at a time); the row opens the song with that take.
 */
export function ProfileRecordingRow({ recording }: { recording: ProfileRecording }) {
  const { t, locale } = useLocale();
  const { activePlaybackId, isRecordingPlaying, handleTogglePlay } = useAudio();
  const playing = activePlaybackId === recording.id && isRecordingPlaying;
  const date = new Date(recording.created_at).toLocaleDateString(LOCALE_DATE_TAGS[locale], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const label = t(playing ? "user.profile.pause" : "user.profile.play", { name: recording.recording_name });

  return (
    <li className="flex items-center border-b border-line last:border-b-0" data-testid="profile-recording">
      {recording.audio_url ? (
        <button
          type="button"
          onClick={() => handleTogglePlay(toPlayableRecording(recording), recording.audio_url ?? undefined)}
          aria-label={label}
          aria-pressed={playing}
          title={label}
          className={cn(
            "ms-2 flex size-tap shrink-0 items-center justify-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            playing ? "bg-accent text-on-accent" : "text-fg hover:bg-surface-2",
          )}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current translate-x-px" />}
        </button>
      ) : (
        <span className="ms-2 size-tap shrink-0" aria-hidden />
      )}
      <ListRow
        asChild
        title={recording.recording_name}
        meta={[recording.song_title, date]}
        trailing={<ChevronRight className="size-4 text-fg-subtle" aria-hidden />}
        className="min-w-0 flex-1 border-b-0 ps-2"
      >
        <Link href={recordingPermalink(recording.id)} />
      </ListRow>
    </li>
  );
}
