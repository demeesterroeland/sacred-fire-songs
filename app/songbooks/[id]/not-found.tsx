import NotFound from '@/components/common/feedback/NotFound';

/** Unknown, or unreadable, songbook: its own copy; the generic 404 lives in app/not-found.tsx. */
export default function SongbookNotFound() {
  return <NotFound icon="music" titleKey="songbooks.notFound.title" descriptionKey="songbooks.notFound.description" />;
}
