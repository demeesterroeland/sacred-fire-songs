import { createPdfDocument, drawPlaylistPdf, type ExportPlaylistData } from '../../../lib/export/pdfExport';

/** One piece of text the PDF builder drew: what, where and in which size. */
export interface DrawnText {
  text: string;
  x: number;
  y: number;
  size: number;
  page: number;
}

/**
 * Runs the real PDF builder on a document whose `text()` calls are recorded, so a test can assert on what is printed
 * (the PDF stores text as glyph ids, so the output bytes cannot be read back). Nothing is mocked: the document is a real jsPDF.
 */
export async function recordPlaylistPdf(playlist: ExportPlaylistData): Promise<{ drawn: DrawnText[]; lines: string[]; blob: Blob }> {
  const doc = createPdfDocument();
  const drawn: DrawnText[] = [];
  const original = doc.text.bind(doc);
  (doc as unknown as { text: unknown }).text = (text: string | string[], x: number, y: number, ...rest: unknown[]) => {
    for (const part of Array.isArray(text) ? text : [text]) {
      drawn.push({ text: part, x, y, size: doc.getFontSize(), page: doc.getCurrentPageInfo().pageNumber });
    }
    return (original as (...args: unknown[]) => unknown)(text, x, y, ...rest);
  };
  await drawPlaylistPdf(doc, playlist);
  // Text drawn at (nearly) the same height on a page is one printed line, left to right.
  const rows = new Map<string, DrawnText[]>();
  for (const d of drawn) {
    const key = `${d.page}:${Math.round(d.y / 3)}`;
    rows.set(key, [...(rows.get(key) ?? []), d]);
  }
  const lines = [...rows.values()].map((row) => row.sort((a, b) => a.x - b.x).map((d) => d.text).join(' ').replace(/\s+/g, ' ').trim());
  return { drawn, lines, blob: doc.output('blob') };
}
