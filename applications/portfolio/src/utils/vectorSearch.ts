// Vector search via Web Worker for embeddings
import type { WorkerStatus } from "./embeddingsWorkerClient";
import {
  onStatus,
  offStatus,
  search as workerSearch,
  embed as workerEmbed,
} from "./embeddingsWorkerClient";

export type KBItem = { id: string; text: string; embedding?: number[] };
export type SearchResult = { id: string; text: string; score: number };

export async function embedText(
  text: string,
  onStatusUpdate?: (s: WorkerStatus) => void,
): Promise<number[]> {
  if (onStatusUpdate) onStatus(onStatusUpdate);
  try {
    return await workerEmbed(text);
  } finally {
    if (onStatusUpdate) offStatus();
  }
}

export async function embedAndSearch(
  query: string,
  k = 5,
  onStatusUpdate?: (s: WorkerStatus) => void,
) {
  const base = (import.meta as any).env.BASE_URL || "/portfolio/";
  const res = await fetch(`${base}knowledge_base.json`);
  const kb: KBItem[] = await res.json();
  if (onStatusUpdate) onStatus(onStatusUpdate);
  try {
    const topK = await workerSearch(query, kb, k);
    return { topK };
  } finally {
    if (onStatusUpdate) offStatus();
  }
}
