import { notFound, redirect } from 'next/navigation';
import GuestGate from '@/components/common/GuestGate';
import { createClient } from '@/lib/supabase/server';
import { parseRecordingParam, recordingPermalink, songRecordingPath } from '@/lib/songs/recordingLink';

/**
 * Recording permalink: `/recordings/<id>` → `/songs/<compositionId>?recording=<id>`.
 * RLS decides access (owner, share recipients, public recordings). Guests who cannot
 * see the recording get the GuestGate (sign in, then back here); signed-in users without access
 * get a 404, so the link does not reveal that the recording exists.
 */
export default async function RecordingPermalinkPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseRecordingParam((await params).id);
  if (!id) notFound();

  const supabase = await createClient();
  const [{ data: { user } }, { data: recording }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('user_recordings').select('id, song_versions(composition_id)').eq('id', id).maybeSingle(),
  ]);

  const version = (recording as { song_versions?: { composition_id?: string } | { composition_id?: string }[] } | null)
    ?.song_versions;
  const compositionId = Array.isArray(version) ? version[0]?.composition_id : version?.composition_id;

  if (compositionId) redirect(songRecordingPath(compositionId, id));
  if (!user) {
    return (
      <div className="p-4">
        <GuestGate feature="sharing" next={recordingPermalink(id)} />
      </div>
    );
  }
  notFound();
}
