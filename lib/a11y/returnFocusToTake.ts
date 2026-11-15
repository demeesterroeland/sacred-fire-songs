/**
 * Dialogs opened from a take's actions sheet (Make public, Share, Singer): the sheet that opened them is gone
 * by the time they close, so focus would fall to <body>. Hand it back to the take's "More actions" button.
 * Use as `onCloseAutoFocus` of the dialog content.
 */
export function returnFocusToTake(recordingId: string) {
  return (event: Event) => {
    const opener = document.querySelector<HTMLElement>(
      `[data-recording-id="${CSS.escape(recordingId)}"] button[aria-haspopup="dialog"]`
    );
    if (opener) {
      event.preventDefault();
      opener.focus({ preventScroll: true });
    }
  };
}
