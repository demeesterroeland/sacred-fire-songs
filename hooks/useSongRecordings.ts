import { useQuery } from '@tanstack/react-query';
import { getUserRecordings, type UserRecording } from '@/lib/actions/rehearsal';

export function useSongRecordings(songVersionId?: string) {
  return useQuery({
    queryKey: ['song-recordings', songVersionId],
    queryFn: () => getUserRecordings(songVersionId!),
    enabled: !!songVersionId,
  });
}
