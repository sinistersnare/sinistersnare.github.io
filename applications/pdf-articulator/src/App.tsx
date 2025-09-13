import React from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// Prefer Vite's worker import to create a Worker instance for the ESM worker.
// This avoids CORS and module-type issues.
// The `?worker` query returns a Worker constructor.
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import { buildNewPdf } from './pdf/buildNewPdf';
import type { PdfMetadata, TocEntry } from './types/pdf';
import { GrowableOutlineList } from './ui/components';

type ProcessingStatus =
  | 'loading'
  | 'idle'
  | 'reading'
  | 'analyzing'
  | 'reviewing' // new: user verifies outline before build
  | 'building'
  | 'error'
  | 'success';

const statusMessages: Record<ProcessingStatus, string> = {
  loading: 'Loading necessary libraries...',
  idle: 'Upload a PDF to begin',
  reading: 'Reading and extracting text from PDF...',
  analyzing: 'Asking AI to generate a table of contents...',
  reviewing: 'Review the generated outline, then continue to build the PDF...',
  building: 'Building new PDF with bookmarks and metadata...',
  error: 'An error occurred. Please try again.',
  success: 'Success! Your PDF is ready for download.',
};

// --- HELPER & UI COMPONENTS ---

const Icon: React.FC<{
  type: 'upload' | 'key' | 'download' | 'spinner' | 'error' | 'review';
}> = ({ type }) => {
  const SvgContent = () => {
    switch (type) {
      case 'upload':
        return <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12" />;
      case 'key':
        return (
          <>
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 8.5 5.5 5.5" />
          </>
        );
      case 'download':
        return (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </>
        );
      case 'spinner':
        return <path d="M21 12a9 9 0 1 1-6.219-8.56" />;
      case 'error':
        return (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </>
        );
      case 'review':
        // Book icon for review state
        return (
          <>
            <path d="M3 6a2 2 0 0 1 2-2h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
            <path d="M17 4h1a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2h-2" />
            <path d="M6 8h8" />
            <path d="M6 12h8" />
          </>
        );
    }
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={type === 'spinner' ? 'animate-spin' : ''}
    >
      <SvgContent />
    </svg>
  );
};

// Configure a dedicated worker instance for PDF.js
GlobalWorkerOptions.workerPort = new PdfWorker();

const App: React.FC = () => {
  const [status, setStatus] = React.useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [apiKey, setApiKey] = React.useState<string>('');
  const [pendingMetadata, setPendingMetadata] = React.useState<PdfMetadata | null>(null);
  const [pendingPageContents, setPendingPageContents] = React.useState<
    { page: number; text: string }[] | null
  >(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [pendingFullText, setPendingFullText] = React.useState<string>('');
  const [docTitle, setDocTitle] = React.useState<string>('');
  const [docAuthor, setDocAuthor] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processPdf(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!libsLoaded) return;
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!libsLoaded) return;
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processPdf(file);
  };

  const extractTextFromPdf = async (
    file: File,
  ): Promise<{
    fullText: string;
    pageContents: { page: number; text: string }[];
    initialOutline: TocEntry[];
    initialTitle: string;
    initialAuthor: string;
  }> => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const loadingTask = getDocument({ data: typedArray });
          const pdf = await loadingTask.promise;
          let fullText = '';
          const pageContents: { page: number; text: string }[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ');
            fullText += pageText + '\n\n';
            pageContents.push({ page: i, text: pageText });
          }
          // Try to read document metadata (Title/Author)
          let initialTitle = '';
          let initialAuthor = '';
          try {
            const meta = await pdf.getMetadata();
            initialTitle = (meta as any)?.info?.Title || '';
            initialAuthor = (meta as any)?.info?.Author || '';
          } catch {}

          // Try to read existing outline/bookmarks and map to pages
          const resolveDestToPage = async (dest: any): Promise<number | undefined> => {
            try {
              const destArray = Array.isArray(dest)
                ? dest
                : dest
                ? await pdf.getDestination(dest)
                : null;
              if (!destArray || !destArray[0]) return undefined;
              const pageIndex = await pdf.getPageIndex(destArray[0]);
              return pageIndex + 1; // 1-based
            } catch {
              return undefined;
            }
          };

          const convertOutline = async (
            items: any[] | null | undefined,
            level = 1,
          ): Promise<TocEntry[]> => {
            if (!items || items.length === 0) return [];
            const result: TocEntry[] = [];
            for (const it of items) {
              const page = await resolveDestToPage((it as any)?.dest);
              const children = await convertOutline((it as any)?.items, level + 1);
              result.push({
                level,
                title: (it as any)?.title || '',
                text_snippet: '',
                page,
                children: children.length ? children : undefined,
              });
            }
            return result;
          };

          let initialOutline: TocEntry[] = [];
          try {
            const outline = await pdf.getOutline();
            initialOutline = await convertOutline(outline as any[]);
          } catch {
            initialOutline = [];
          }

          resolve({ fullText, pageContents, initialOutline, initialTitle, initialAuthor });
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const callGeminiApi = async (text: string): Promise<PdfMetadata> => {
    // ... (rest of the function is identical)
    const systemPrompt = `You are a document analysis expert. Your task is to analyze the provided text from a PDF and generate a structured JSON output containing the document's title, author, and a hierarchical table of contents (TOC).

      Rules for the output:
      1. The output MUST be a single, valid JSON object.
      2. The JSON object must have three top-level keys: "title", "author", and "toc".
      3. "title": A string containing the main title of the document.
      4. "author": A string containing the author's name. If no author is found, set it to "Unknown".
      5. "toc": An array of TOC entry objects.
      6. Each TOC entry object must have:
         - "level": An integer (1 for main headings, 2 for subheadings, etc.).
         - "title": A string for the heading title.
         - "text_snippet": A short, unique text snippet (5-10 words) from the paragraph immediately following the heading. This will be used to locate the heading in the original PDF.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`;
    const payload = {
      contents: [{ parts: [{ text }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: 'application/json' },
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error('Invalid or empty response from Gemini API.');
    return JSON.parse(jsonText) as PdfMetadata;
  };

  const processPdf = React.useCallback(
    async (file: File) => {
      setStatus('reading');
      setErrorMessage('');
      try {
        const { fullText, pageContents, initialOutline, initialTitle, initialAuthor } =
          await extractTextFromPdf(file);
        // No AI by default; go straight to review
        setPendingMetadata(null);
        setPendingPageContents(pageContents);
        setPendingFullText(fullText);
        setPendingFile(file);
        // Seed editable toc from existing outline if present
        if (initialOutline && initialOutline.length > 0) {
          setEditableToc(initialOutline);
        } else {
          setEditableToc([]);
        }
        setDocTitle(initialTitle || '');
        setDocAuthor(initialAuthor || '');
        setStatus('reviewing');
        console.log('PDF loaded. Ready for optional AI analysis.');
        return;
      } catch (error) {
        console.error(error);
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
        setStatus('error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [apiKey],
  );

  // Confirm build after review
  const confirmAndBuild = async () => {
    if (!pendingFile || !pendingPageContents) return;
    try {
      setStatus('building');
      const originalBytes = new Uint8Array(await pendingFile.arrayBuffer());
      const finalMetadata: PdfMetadata = {
        title:
          (docTitle && docTitle.trim()) || (pendingMetadata && pendingMetadata.title) || 'Untitled',
        author:
          (docAuthor && docAuthor.trim()) ||
          (pendingMetadata && pendingMetadata.author) ||
          'Unknown',
        toc: editableToc,
      };
      const newPdfBytes = await buildNewPdf(originalBytes, finalMetadata, pendingPageContents);

      const ab = new ArrayBuffer(newPdfBytes.byteLength);
      new Uint8Array(ab).set(newPdfBytes);
      const blob = new Blob([ab], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      // Build filename: LastName - Title.pdf
      const chosenTitle = finalMetadata.title || 'Untitled';
      const chosenAuthor = finalMetadata.author || 'Unknown';
      const deriveLastName = (author: string): string => {
        if (!author) return 'Document';
        const firstAuthor = author.split(/;|&| and /i)[0].trim();
        if (firstAuthor.includes(',')) {
          const last = firstAuthor.split(',')[0].trim();
          return last || 'Document';
        }
        const parts = firstAuthor.split(/\s+/).filter(Boolean);
        return (parts[parts.length - 1] || 'Document').trim();
      };
      const toSafePart = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
      const lastName = toSafePart(deriveLastName(chosenAuthor));
      const cleanTitle = toSafePart(chosenTitle);
      const fileName = `${lastName} - ${cleanTitle}.pdf`;
      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      setStatus('success');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setStatus('error');
    }
  };

  const libsLoaded = status !== 'loading';

  // Propose pages for review using text snippets if page is missing
  const findPageForSnippet = React.useCallback(
    (snippet: string, pages: { page: number; text: string }[]) => {
      if (!snippet) return undefined;
      const needle = snippet.trim().toLowerCase();
      const hit = pages.find((p) => p.text?.toLowerCase().includes(needle));
      return hit ? hit.page : undefined; // 1-based
    },
    [],
  );

  const proposePages = React.useCallback(
    (toc: TocEntry[], pages: { page: number; text: string }[]): TocEntry[] => {
      return toc.map((item) => {
        const proposedPage =
          typeof item.page === 'number' ? item.page : findPageForSnippet(item.text_snippet, pages);
        return {
          ...item,
          page: proposedPage,
          children: item.children ? proposePages(item.children, pages) : undefined,
        };
      });
    },
    [findPageForSnippet],
  );

  const reviewToc: TocEntry[] = React.useMemo(() => {
    if (!pendingMetadata || !pendingPageContents) return [];
    return proposePages(pendingMetadata.toc, pendingPageContents);
  }, [pendingMetadata, pendingPageContents, proposePages]);

  // Editable outline list for the form
  const [editableToc, setEditableToc] = React.useState<TocEntry[]>([]);
  React.useEffect(() => {
    // Only overwrite from AI-proposed TOC when it exists; do not clobber outline extracted from PDF
    if (status === 'reviewing' && pendingMetadata && reviewToc.length > 0) {
      setEditableToc(reviewToc);
    }
  }, [status, reviewToc, pendingMetadata]);

  return (
    <div className="app-card">
      <div className="text-center" style={{ marginBottom: '1.5rem' }}>
        <h1 className="app-title">PDF Articulator</h1>
        <p className="app-subtitle">Automatically add a table of contents to any text-based PDF.</p>
      </div>

      <div
        className={
          'dropzone' + (libsLoaded ? '' : ' is-disabled') + (isDragOver ? ' is-dragover' : '')
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon" aria-hidden>
          <Icon type="upload" />
        </div>
        <label
          htmlFor="file-upload"
          className="btn-file"
          style={{ cursor: libsLoaded ? 'pointer' : 'not-allowed' }}
        >
          <span>{libsLoaded ? 'Choose a PDF file' : 'Loading libraries...'}</span>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".pdf"
            disabled={!libsLoaded}
          />
        </label>
        <p className="muted">or drag and drop</p>
      </div>

      <div className="field" style={{ opacity: libsLoaded ? 1 : 0.5, marginTop: '0.75rem' }}>
        <label htmlFor="api-key" className="label">
          Gemini API key (optional)
        </label>
        <div className="input-icon-group">
          <div className="icon-left" aria-hidden>
            <Icon type="key" />
          </div>
          <input
            id="api-key"
            type="password"
            className="input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={!libsLoaded}
            placeholder="Enter your API key here"
          />
        </div>
        <p className="muted" style={{ marginTop: '0.25rem' }}>
          Only required for AI analysis (Analyze with AI). Leave blank for manual outline editing.
          Your key stays in the browser.
        </p>
      </div>

      {status !== 'idle' && status !== 'loading' && (
        <div className={'statusbar' + (status === 'error' ? ' status-error' : '')}>
          <div className="icon">
            {status === 'error' ? (
              <Icon type="error" />
            ) : status === 'success' ? (
              <Icon type="download" />
            ) : status === 'reviewing' ? (
              <Icon type="review" />
            ) : (
              <Icon type="spinner" />
            )}
          </div>
          <div>
            <p className="title">{statusMessages[status]}</p>
            {status === 'error' && <p className="message">{errorMessage}</p>}
          </div>
        </div>
      )}

      {status === 'reviewing' && (
        <div style={{ marginTop: '1rem', color: '#2d3748' }}>
          <h2 style={{ margin: 0 }}>Proposed outline</h2>
          <p className="muted" style={{ marginTop: '0.25rem' }}>
            Build your outline manually, or analyze with AI to propose one.
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmAndBuild();
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div className="field">
                  <label htmlFor="doc-title" className="label">
                    Title
                  </label>
                  <input
                    id="doc-title"
                    type="text"
                    className="input"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document title"
                  />
                </div>
                <div className="field">
                  <label htmlFor="doc-author" className="label">
                    Author
                  </label>
                  <input
                    id="doc-author"
                    type="text"
                    className="input"
                    value={docAuthor}
                    onChange={(e) => setDocAuthor(e.target.value)}
                    placeholder="Author"
                  />
                </div>
              </div>
              <GrowableOutlineList items={editableToc} onChange={setEditableToc} />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn-file">
                  Looks good — build PDF
                </button>
                <button
                  type="button"
                  className="btn-file"
                  onClick={async () => {
                    if (editableToc.length > 0) {
                      const proceed = window.confirm(
                        'Running AI analysis will replace the current outline list. Continue?',
                      );
                      if (!proceed) return;
                    }
                    if (!apiKey) {
                      alert('Please enter your Gemini API key to use AI analysis.');
                      return;
                    }
                    try {
                      setStatus('analyzing');
                      const metadata = await callGeminiApi(pendingFullText);
                      setPendingMetadata(metadata);
                      // Prefer AI-proposed title/author if provided
                      if (metadata?.title) setDocTitle(metadata.title);
                      if (metadata?.author) setDocAuthor(metadata.author);
                      if (pendingPageContents) {
                        const proposed = proposePages(metadata.toc, pendingPageContents);
                        setEditableToc(proposed);
                      } else {
                        setEditableToc(metadata.toc);
                      }
                      setStatus('reviewing');
                    } catch (err) {
                      console.error(err);
                      setErrorMessage(err instanceof Error ? err.message : 'AI analysis failed.');
                      setStatus('error');
                    }
                  }}
                >
                  Analyze with AI (replace list)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
