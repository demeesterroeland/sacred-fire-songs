import NotFound from '@/components/common/feedback/NotFound';

/**
 * Shown when a recording permalink cannot be opened. The copy is the same whether the
 * recording does not exist or the viewer has no access, so the link reveals nothing.
 */
export default function RecordingNotFound() {
  return (
    <NotFound
      titleKey="feedback.notFound.recording.title"
      descriptionKey="feedback.notFound.recording.description"
    />
  );
}
