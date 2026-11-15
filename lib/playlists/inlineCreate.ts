// #604: the inline "New playlist" field (Library → Playlists) creates a playlist
// only on an explicit action. Clicking or tapping away (blur) and Escape cancel.
export type InlineCreateTrigger = 'enter' | 'create' | 'escape' | 'blur';

export function inlineCreateIntent(trigger: InlineCreateTrigger, title: string): 'create' | 'cancel' {
  if (trigger !== 'enter' && trigger !== 'create') return 'cancel';
  return title.trim() ? 'create' : 'cancel';
}
