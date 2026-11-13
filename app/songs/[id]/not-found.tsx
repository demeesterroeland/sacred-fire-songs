import NotFound from '@/components/common/feedback/NotFound';

/** Unknown song id: keeps the song-specific copy; the generic 404 lives in app/not-found.tsx. */
export default function SongNotFound() {
  return (
    <NotFound
      icon="music"
      titleKey="feedback.notFound.title"
      descriptionKey="feedback.notFound.description"
    />
  );
}
