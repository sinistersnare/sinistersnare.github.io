# PDF Articulator

(This document written by LLM but its pretty comprehensive!)

A small React + TypeScript tool to add a clickable table of contents (PDF bookmarks) to an existing PDF. It runs fully client‑side:

- Parses PDF text with pdf.js to help locate headings.
- Creates bookmarks/outlines with pdf-lib (low-level API).
- Lets you edit Title/Author and the outline before building.
- Optional AI assist (Gemini) to propose a draft outline.
- Downloaded file name format: `LastName - Title.pdf`.

## Tech
- Vite + React + TypeScript
- pdfjs-dist (worker via Vite `?worker`)
- pdf-lib (low-level outlines)

## Quick start (standalone dev)

```sh
cd react-apps/pdf-articulator
pnpm install
pnpm dev
```

Then open the dev server path (note the base path):
- http://localhost:5173/pdf-articulator/

Upload a PDF, optionally enter a Gemini API key in the UI if you want AI analysis.

## Build (app only)

```sh
cd react-apps/pdf-articulator
pnpm build
```

This emits `dist/` with `manifest.json`, JS, CSS, and the pdf.js worker.

## Zola integration (monorepo)

This repo uses a Zola macro to inject the Vite build by reading the manifest at:
- `react-apps/<name>/dist/manifest.json`

Macro: `templates/macros/react.html`

The `pdf-articulator` page template mounts it at `/pdf-articulator`:
- `templates/code/pdf_articulator.html`

### Full site build

From the repo root:

```sh
pnpm run build
```

This will:
- Build all React apps → `react-apps/*/dist/`
- Build Zola → `public/`
- Copy each React app’s `dist/` into `public/<app>/` for serving

Then serve locally:

```sh
pnpm run serve
```

Open http://127.0.0.1:1111/code/pdf-articulator/ (or wherever you link it) and the app will be mounted.

## Usage
1. Upload a PDF (text-based for best results).
2. The app will try to extract existing Title/Author and outline.
3. Edit Title, Author, and the outline list.
4. (Optional) Click "Analyze with AI" to replace the list with a proposed outline.
5. Click "Looks good — build PDF" to download the updated file.

Filename will be `LastName - Title.pdf` (derived from Author/Title; multiple authors take the first).

## Troubleshooting
- "Manifest not found" in Zola page:
  - Ensure you ran the React build before `zola build` (root script does this for you).
  - Check that `react-apps/pdf-articulator/dist/manifest.json` exists.
- Dev server 404:
  - Use the base path: http://localhost:5173/pdf-articulator/
- pdf.js worker errors:
  - The worker is bundled via `import '.../pdf.worker.mjs?worker'`; Vite handles it in dev and build.

## Security/Privacy
- PDFs are processed in-browser. No server upload.
- AI analysis, if used, sends extracted text to Gemini with your API key (entered in the UI, not stored).
- Your API Key is not sent to a server that I own, check your network logs to confirm.