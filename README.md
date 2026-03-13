# KisanRakshak (किसान रक्षक)

A lightweight, offline-first Progressive Web App (PWA) for farmers in Neemuch-Mandsaur (MP) that provides a pesticide guide, dosage calculator, pest/disease watchlist, and organic farming tips.

## ✅ Deployment Ready
This project is a **static PWA** (HTML + CSS + JS) and can be hosted on any static hosting provider (GitHub Pages / Netlify / Vercel / S3 / etc.).

### ✅ What is included
- Fully standalone single-page app (`index.html`) with all UI, scripts, and styles inlined for simplicity
- `manifest.json` and `sw.js` for PWA installability & offline caching
- Icons and splash assets under `icons/`
- Offline fallback page baked into service worker

---

## 🚀 Deploy Options

### GitHub Pages
1. Push the repository to GitHub.
2. Enable **GitHub Pages** in repository settings.
3. Set the publish source to `main` branch → `/ (root)`.
4. (Optional) Add a `404.html` redirect if you want single-page fallback.

### Netlify / Vercel
1. Connect the repo to Netlify / Vercel.
2. Build command: **(none needed)**
3. Publish directory: `.` (root)

### Local Quick Start (for testing)
```bash
# from repo root
npx http-server -c-1
```
Then visit: http://localhost:8080

---

## ✅ Notes for Deployment
- The PWA is configured to work from a **relative path** so it can run from a subfolder (e.g., GitHub Pages under `/your-repo/`).
- The service worker pre-caches core assets and supports offline usage.

---

## 📌 Troubleshooting
- If the app doesn’t install, ensure you’re serving over **HTTPS** (or `localhost`).
- If the service worker seems stale after updates, refresh the page and/or clear the browser cache.

---

Enjoy! 🌾
