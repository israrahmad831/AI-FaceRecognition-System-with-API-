// Small utility to download face-api.js model files into public/models (ESM-compatible)
// Usage: node scripts/download-models.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'models');
const base = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const manifests = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-weights_manifest.json',
];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(dest, buf);
}

(async () => {
  try {
    for (const manifest of manifests) {
      const url = base + manifest;
      console.log('Fetching manifest', url);
      const data = await fetchJson(url);

      // save manifest
      const manifestPath = path.join(outDir, manifest);
      await fs.promises.writeFile(manifestPath, JSON.stringify(data, null, 2));

      // download files referenced in manifest
      for (const group of data) {
        for (const file of group.paths) {
          const fileUrl = base + file;
          const dest = path.join(outDir, file);
          if (fs.existsSync(dest)) {
            console.log('Already exists:', file);
            continue;
          }
          // ensure directory exists
          await fs.promises.mkdir(path.dirname(dest), { recursive: true });
          console.log('Downloading', fileUrl);
          // eslint-disable-next-line no-await-in-loop
          await download(fileUrl, dest);
        }
      }
    }
    console.log('All models downloaded to', outDir);
  } catch (err) {
    console.error('Failed to download models:', err);
    process.exit(1);
  }
})();
