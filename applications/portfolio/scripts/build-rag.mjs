#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "@xenova/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const contentDir = path.resolve(repoRoot, "content");
const outDir = path.resolve(appRoot, "dist");
const outFile = path.resolve(outDir, "knowledge_base.json");

async function readMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await readMarkdown(p)));
    else if (e.isFile() && /\.md$/.test(e.name)) files.push(p);
  }
  return files;
}

function chunkText(text, max = 800) {
  const parts = [];
  let i = 0;
  while (i < text.length) {
    parts.push(text.slice(i, i + max));
    i += max;
  }
  return parts;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const files = await readMarkdown(contentDir);
  const docs = [];
  for (const f of files) {
    const raw = await fs.readFile(f, "utf8");
    const body = raw.replace(/^\+\+[\s\S]*?\+\+\+/m, "");
    const chunks = chunkText(body);
    chunks.forEach((c, idx) =>
      docs.push({ id: `${path.relative(repoRoot, f)}#${idx}`, text: c }),
    );
  }

  const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const out = [];
  for (const d of docs) {
    const output = await embed(d.text, { pooling: "mean", normalize: true });
    out.push({ ...d, embedding: Array.from(output.data) });
  }

  await fs.writeFile(outFile, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} embeddings to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
