import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useRecordingsQuery(userId?: string) {
  const { data: userRecordingCompositionIds = new Set<string>() } = useQuery({
    queryKey: ['user-recordings-compositions', userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const supabase = createClient();
      const { data: recordings } = await supabase
        .from('user_recordings')
        .select('song_version_id, song_versions(composition_id)')
        .eq('user_id', userId);

      const compIds = new Set<string>();
      for (const item of recordings ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compId = (item.song_versions as any)?.composition_id;
        if (compId) compIds.add(compId);
      }
      return compIds;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  return { userRecordingCompositionIds };
}
