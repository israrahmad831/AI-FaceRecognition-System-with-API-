# AI Face Recognition System (with API) 🤖🧠

**Short description:** This repository contains a simple face-recognition demo with a React frontend and a Node backend. The frontend supports uploading labeled images (dataset) and a live camera page that recognizes faces from the uploaded dataset using face-api.js.

---

## 🚀 Features
- Upload images and assign a person name (stored in browser localStorage for quick prototyping)
- Live camera page that detects faces and displays `Name — XX%` match or `Not matching with anyone`
- Option to host face-api.js model weights locally (recommended for offline use)

---

## 🧩 Repo structure
- `FRfrontend/` — React + Vite frontend (Upload page, Camera page)
- `FRbackend/` — Node backend (currently minimal)
- `scripts/`, `public/models/` — helpers and hosting area for model weights

---

## ⚙️ Prerequisites
- Node.js 18+ (or latest LTS)
- npm
- (Optional) Git LFS if you plan to commit large model weight files

---

## 📦 Setup — Frontend
1. Install dependencies:

```bash
cd FRfrontend
npm install
```

2. Download model files into `public/models` (choose one):

- Recommended (automatic):

```bash
npm run download-models
```

- Manual: copy weights from your local download (or the original face-api.js `weights/` folder) into `FRfrontend/public/models`. See `FRfrontend/public/models/README.md` for details.

> Note: `FRfrontend/public/models` is ignored by default (`.gitignore`). If you want to add model files to the repo, use Git LFS (`.gitattributes` is provided).

3. Start dev server:

```bash
npm run dev
# open the URL shown by Vite (usually http://localhost:5173)
```

---

## 🔧 Setup — Backend
The backend is minimal (placeholder). If you want to extend it to host datasets or persist images, do the following:

```bash
cd FRbackend
npm install
# run the server (if implemented)
node server.js
```

---

## 🧪 How to use (Frontend)
1. Open the app in your browser (Vite dev URL).
2. Go to **Upload** → add a `Person name` and choose an image. Click **Upload**.
   - The dataset is stored in your browser's `localStorage` under `face-db`.
3. Go to **Camera** → allow camera access. The page will load models from `/models` and start recognizing faces.
   - If a match is found, the overlay text shows `Name — NN%`.
   - If no match, the overlay shows `Not matching with anyone`.

---

## 🔐 Security & Privacy notes
- Uploaded images are stored in browser `localStorage` by default (local to the browser only).
- For production or sharing, do **not** store images in plain `localStorage`. Instead, send them to a secure server, store them encrypted, and follow privacy laws in your jurisdiction.
- Get explicit user consent before using face recognition on real users.

---

## 📁 Cleanup & Best Practices
- Large model weight files can be tens of MBs — avoid committing them directly to git. Use **Git LFS** if you must store them in the repo.
- If you need to free disk space locally, you can remove `node_modules/` and reinstall with `npm install` later.

---

## 🐞 Troubleshooting
- Models not loading: ensure `FRfrontend/public/models` contains the model manifest JSON and corresponding `.bin` shards, and dev server is running.
- TypeScript/typing errors for `face-api.js`: a simple `src/types.d.ts` shim is included to avoid build-time type errors.
- If camera doesn't start: check browser permissions and that no other app is using the camera.

---

## 📜 License & Credits
- This project uses **face-api.js** (MIT). See `LICENSE` and the original project for full details: https://github.com/justadudewhohacks/face-api.js

---

## 📬 Next steps I can help with
- Persist dataset on the backend and replace localStorage with API endpoints
- Add model hosting to a CDN or serve weights from the backend
- Improve accuracy: accept multiple training images per person, run preprocessing, or switch to other models (MediaPipe / TF.js)

---

If you want, I can now:
- Commit the cleanup changes and remove `node_modules` to reclaim space, or
- Add server-side dataset storage and API endpoints.

Reply with which task you want next (e.g., `commit cleanup`, `remove node_modules`, `add backend persistence`).
