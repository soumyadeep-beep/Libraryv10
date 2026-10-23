# Reader v10 — deployment notes

## Install on a phone
1. Publish this folder to an HTTPS host (for example, GitHub Pages). A service worker will not run from a `file://` URL.
2. Open `Libraryv10-mobile.html` in Chrome on Android.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen** (the wording varies by Chrome version).
4. Open the installed app once while online so the app shell and third-party reader libraries can be cached.

Use `index.html` for the desktop-oriented entry point. The mobile page uses `manifest-mobile.webmanifest`.

## Offline behavior
The service worker caches both HTML entry points, manifests, and icons. It also caches the reader libraries and Google Fonts after they have successfully loaded online. Offline use of EPUB/PDF rendering therefore requires the first successful online load of those dependencies. AI features, external metadata lookups, and any other network-backed integrations still require connectivity.

## Important security and storage notes
- The Gemini API key is stored in browser local storage. This is acceptable only for personal use on a trusted device; it is not secure for a public, multi-user deployment. A server-side proxy is needed to keep a shared API key private.
- Book files, reading progress, and settings are stored in the browser's IndexedDB/local storage. Clearing site data can erase them. Keep original book files separately; a dedicated backup/export feature is not included in this build.
- Browser storage persistence is best-effort and cannot guarantee data will never be evicted.

## APK
This folder is a Progressive Web App source, not an Android APK. Install it through a supported browser, or wrap the hosted site with an Android packaging tool if a standalone APK is required.
