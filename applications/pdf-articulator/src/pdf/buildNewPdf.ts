import { PDFDocument, PDFName, PDFNumber, PDFString } from 'pdf-lib';
import type { PdfMetadata } from '../types/pdf';

/**
 * Build a new PDF with core metadata and clickable Bookmarks (Outlines).
 * - Loads the original bytes
 * - Sets Title/Author/Producer/Creator
 * - Maps TOC entries to pages by searching page text for a snippet
 * - Creates top-level outline items that jump to the top of the matched page
 */
export async function buildNewPdf(
  originalFileBytes: Uint8Array,
  metadata: PdfMetadata,
  pageContents: { page: number; text: string }[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalFileBytes);

  // Core metadata
  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  pdfDoc.setProducer('PDF Articulator');
  pdfDoc.setCreator('PDF Articulator');

  // Helper to find a 0-based page index for a given unique text snippet
  const findPageForSnippet = (snippet: string): number | null => {
    if (!snippet) return null;
    const needle = snippet.trim().toLowerCase();
    for (const p of pageContents) {
      if (p?.text && p.text.toLowerCase().includes(needle)) {
        return Math.max(0, (p.page || 1) - 1);
      }
    }
    return null;
  };

  // Resolve all target pages for TOC entries, skipping those we can't match
  const pages = pdfDoc.getPages();
  const context = pdfDoc.context;

  const outlineItemDicts: any[] = [];
  const outlineItemRefs: any[] = [];

  for (const entry of metadata.toc || []) {
    // Prefer explicit page if provided; fallback to snippet search
    const pageIdx =
      typeof entry.page === 'number' && !Number.isNaN(entry.page)
        ? Math.max(0, (entry.page || 1) - 1)
        : findPageForSnippet(entry.text_snippet);
    if (pageIdx === null || !pages[pageIdx]) continue;

    const pageRef = pages[pageIdx].ref;

    // Create a destination array pointing to the top of the page using /Fit
    const destArray = context.obj([pageRef, PDFName.of('Fit')]);

    // Create the outline item dict; we'll link Parent/Prev/Next later
    const itemDict = context.obj({});
    const itemRef = context.register(itemDict);

    itemDict.set(PDFName.of('Title'), PDFString.of(entry.title || ''));
    itemDict.set(PDFName.of('Dest'), destArray);

    outlineItemDicts.push(itemDict);
    outlineItemRefs.push(itemRef);
  }

  if (outlineItemRefs.length > 0) {
    // Create Outlines dictionary and register it so we have its ref for Parent pointers
    const outlinesDict = context.obj({});
    const outlinesRef = context.register(outlinesDict);

    // Wire up doubly-linked list among top-level items and set Parent to Outlines
    for (let i = 0; i < outlineItemDicts.length; i++) {
      const dict = outlineItemDicts[i];
      dict.set(PDFName.of('Parent'), outlinesRef);
      if (i > 0) dict.set(PDFName.of('Prev'), outlineItemRefs[i - 1]);
      if (i < outlineItemDicts.length - 1) dict.set(PDFName.of('Next'), outlineItemRefs[i + 1]);
    }

    // Set First/Last and Count on Outlines; positive Count expands by default
    outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
    outlinesDict.set(PDFName.of('First'), outlineItemRefs[0]);
    outlinesDict.set(PDFName.of('Last'), outlineItemRefs[outlineItemRefs.length - 1]);
    outlinesDict.set(PDFName.of('Count'), PDFNumber.of(outlineItemRefs.length));

    // Attach to the catalog (cast to any to access internal catalog API)
    const catalog = (pdfDoc as any).catalog;
    catalog.set(PDFName.of('Outlines'), outlinesRef);
  }

  return pdfDoc.save();
}
