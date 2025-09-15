/// <reference lib="webworker" />
import { pipeline } from "@xenova/transformers";

type MsgIn =
  | { type: "init" }
  | { type: "embed"; text: string }
  | {
      type: "search";
      query: string;
      kb: { id: string; text: string; embedding?: number[] }[];
      k: number;
    };

type MsgOut =
  | {
      type: "status";
      status: "loading-model" | "ready" | "embedding" | "searching";
    }
  | { type: "embed-result"; embedding: number[] }
  | {
      type: "search-result";
      topK: { id: string; text: string; score: number }[];
    }
  | { type: "error"; message: string };

let embedder: any | null = null;

function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

async function getModel() {
  if (!embedder) {
    (self as any).postMessage({
      type: "status",
      status: "loading-model",
    } as MsgOut);
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    (self as any).postMessage({ type: "status", status: "ready" } as MsgOut);
  }
  return embedder;
}

self.onmessage = async (ev: MessageEvent<MsgIn>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init":
        await getModel();
        break;
      case "embed": {
        (self as any).postMessage({
          type: "status",
          status: "embedding",
        } as MsgOut);
        const model = await getModel();
        const output = await model(msg.text, {
          pooling: "mean",
          normalize: true,
        });
        (self as any).postMessage({
          type: "embed-result",
          embedding: Array.from(output.data as Float32Array),
        } as MsgOut);
        break;
      }
      case "search": {
        (self as any).postMessage({
          type: "status",
          status: "searching",
        } as MsgOut);
        const model = await getModel();
        const qOut = await model(msg.query, {
          pooling: "mean",
          normalize: true,
        });
        const q = Array.from(qOut.data as Float32Array);
        const scored = [] as { id: string; text: string; score: number }[];
        for (const item of msg.kb) {
          let e: number[];
          if (item.embedding) e = item.embedding;
          else {
            const eOut = await model(item.text, {
              pooling: "mean",
              normalize: true,
            });
            e = Array.from(eOut.data as Float32Array);
          }
          const score = cosine(q, e);
          scored.push({ id: item.id, text: item.text, score });
        }
        scored.sort((a, b) => b.score - a.score);
        (self as any).postMessage({
          type: "search-result",
          topK: scored.slice(0, msg.k),
        } as MsgOut);
        break;
      }
    }
  } catch (e: any) {
    (self as any).postMessage({
      type: "error",
      message: e?.message ?? String(e),
    } as MsgOut);
  }
};
