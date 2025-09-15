export type WorkerStatus =
  | "loading-model"
  | "ready"
  | "embedding"
  | "searching";
export type StatusHandler = (s: WorkerStatus) => void;

type KBItem = { id: string; text: string; embedding?: number[] };
type SearchResult = { id: string; text: string; score: number };

let worker: Worker | null = null;
let statusHandler: StatusHandler | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/embeddings.worker.ts", import.meta.url),
      { type: "module", name: "embeddings-worker" },
    );
    worker.postMessage({ type: "init" });
  }
  return worker;
}

export function onStatus(handler: StatusHandler) {
  statusHandler = handler;
}

export function offStatus() {
  statusHandler = null;
}

export async function embed(text: string): Promise<number[]> {
  const w = getWorker();
  return new Promise((resolve, reject) => {
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg.type === "status" && statusHandler) statusHandler(msg.status);
      if (msg.type === "embed-result") {
        w.removeEventListener("message", onMessage);
        resolve(msg.embedding as number[]);
      } else if (msg.type === "error") {
        w.removeEventListener("message", onMessage);
        reject(new Error(msg.message));
      }
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ type: "embed", text });
  });
}

export async function search(
  query: string,
  kb: KBItem[],
  k: number,
): Promise<SearchResult[]> {
  const w = getWorker();
  return new Promise((resolve, reject) => {
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg.type === "status" && statusHandler) statusHandler(msg.status);
      if (msg.type === "search-result") {
        w.removeEventListener("message", onMessage);
        resolve(msg.topK as SearchResult[]);
      } else if (msg.type === "error") {
        w.removeEventListener("message", onMessage);
        reject(new Error(msg.message));
      }
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ type: "search", query, kb, k });
  });
}
