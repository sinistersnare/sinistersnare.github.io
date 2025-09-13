// Centralized PDF-related types shared across the app

export interface TocEntry {
  level: number;
  title: string;
  text_snippet: string;
  // Optional 1-based page number; preferred when provided
  page?: number;
  // Optional nested TOC entries
  children?: TocEntry[];
}

export interface PdfMetadata {
  title: string;
  author: string;
  toc: TocEntry[];
}
