# God's Pride Schools Website – Dynamic Content Guide

This repository powers the static deployment of the God's Pride Group of Schools website. The UI is still served as plain HTML/CSS/JS, but key copy, carousels, testimonials, and galleries are now hydrated from Firebase Firestore so the communications team can publish updates without touching the codebase.

## Runtime architecture

- **Static shell** – The HTML pages remain in the repository and are deployed to GitHub Pages as before.
- **Firebase bootstrap** – Each page loads a `firebase-config.js` file (ignored by Git) that sets `window.__FIREBASE_CONFIG__`. The helper in `src/firebase/app.js` initialises the Firebase SDK using that global config.
- **Data hooks** – `src/hooks/useFirestore.js` exposes `useDocument`/`useCollection` helpers with in-memory caching and graceful fallbacks.
- **Page hydration** – `src/main.js` scans for elements annotated with `data-document`/`data-field`/`data-collection` attributes, fetches the relevant Firestore records, swaps the DOM content, and dispatches events for widgets (e.g., Slick slider) to reinitialise.
- **Fallback safety** – Before overwriting any DOM node, the script caches its original markup. If Firestore is unreachable, stale, or missing fields, the static fallback is restored.

## Getting started locally

1. **Install dependencies:** No npm install is required; the site uses browser ESM modules and CDN-delivered Firebase packages.
2. **Provide Firebase credentials:**
   - Copy `src/firebase/config.sample.js` to `firebase-config.js` in the repository root (same level as `index.html`).
   - Replace the placeholders with your Firebase project's web config and export it globally:

     ```html
     <!-- firebase-config.js -->
     <script>
       window.__FIREBASE_CONFIG__ = {
         apiKey: 'YOUR_API_KEY',
         authDomain: 'YOUR_AUTH_DOMAIN',
         projectId: 'YOUR_PROJECT_ID',
         storageBucket: 'YOUR_STORAGE_BUCKET',
         messagingSenderId: 'YOUR_SENDER_ID',
         appId: 'YOUR_APP_ID',
       };
     </script>
     ```

   - The file is ignored by Git to keep secrets out of source control.
3. **Serve the site:** Open `index.html` through any static web server (e.g., `python -m http.server`).
4. **Verify data:** With a valid Firebase config and populated Firestore, dynamic sections (announcements, testimonials, galleries, etc.) will populate automatically. Without Firebase or network access, the static fallbacks remain visible.

## Firestore content model

Consult [`docs/content-audit.md`](docs/content-audit.md) for a full matrix of page components mapped to Firestore paths. The high-level structure is:

- `settings/global` (document)
  - `siteName`, `tagline`, `logos.left.url`, `logos.right.url`
  - Optional `logos.left.storagePath`/`logos.right.storagePath` track uploaded assets in Firebase Storage.
  - `contact.email`, `contact.phone`, `address`
  - `social.facebook`, `social.instagram`
  - `footer.copyright`
- `settings/homepage` (document)
  - `intro.title`, `intro.marquee`
  - `announcements.heading`, `testimonials.heading`
- `announcements` (collection)
  - Fields: `title`, `summary`, `body` (HTML), `image.url`, `image.alt`, `publishedAt`, optional `priority`
  - Optional `image.storagePath` references the uploaded image in Firebase Storage.
- `testimonials` (collection)
  - Fields: `quote`, `author`, optional `publishedAt`, `priority`
- `news` (collection)
  - Fields: `title`, `summary`, `body`, `image.url`, `publishedAt`, `link`
  - Optional `image.storagePath` references the uploaded image in Firebase Storage.
- `content/parentsCorner` (document)
  - `heading`, `intro`
- `content/parentsCorner/cards` (collection)
  - Fields: `title`, `items` (array of bullet strings), optional `order`
- `media/homeCarousel` & `media/gallery` (collections)
  - Fields: `url`, `alt`, optional `caption`, `description`, `order`
  - Optional `storagePath` references the uploaded asset in Firebase Storage.
- Page-specific documents under `content/`
  - `content/about`, `content/admissions`, `content/contact`, `content/news`, `content/gallery`
  - `content/schools`, `content/nurseryPrimary`, `content/secondary`

## Publishing workflow for administrators

1. **Plan the update** – Identify the section you want to change and look up its Firestore path in [`docs/content-audit.md`](docs/content-audit.md).
2. **Edit Firestore content** – Use the Firebase console (or an admin tool) to update the document/collection values. Rich text fields accept HTML, which will be inserted directly into the page.
3. **Upload media** – The admin dashboard now lets you upload images directly from your computer. Files are stored in Firebase Storage and the form automatically writes the download URL (and storage path) into Firestore. You can still paste an external URL if preferred. Include `caption`/`alt` text for accessibility.
4. **Save and publish** – Changes go live immediately because the site reads directly from Firestore on each page load. The helper caches responses for five minutes; edits propagate across visitors after that cache window or when a user refreshes.
5. **Fallback awareness** – If a field is missing or Firestore is unavailable, the site reverts to the original static copy committed in this repo. Keep those fallbacks reasonably up to date for resilience.

### Adding new repeatable content

- **Announcements/testimonials/news** – Add a document to the relevant collection. Ordering is controlled via `publishedAt` (descending) and optional `priority` numbers.
- **Carousel images** – Add a document to `media/homeCarousel` with `url`, optional `caption`, and optional numeric `order`.
- **Gallery images** – Add documents to `media/gallery`. Images appear in ascending `order`; if omitted they render in insertion order.

### Maintenance tips

- Because the project is static, no build step is required. Ensure `firebase-config.js` ships alongside the HTML on the hosting platform.
- Keep Firestore security rules tight—limit write access to authorised admins.
- When adding new dynamic sections, annotate the HTML with `data-document`/`data-field` or `data-collection` attributes and update the audit document so future maintainers know where the content lives.

## Troubleshooting

- **Nothing loads / still shows old copy:** Verify `firebase-config.js` is present and includes valid credentials. Check the browser console for Firebase errors.
- **Images missing:** Ensure the Firestore document includes a `url` pointing to a publicly accessible image. Remember to redeploy any new static assets if you are hosting images within the repo.
- **Carousel/testimonial slider misbehaving:** Hydration dispatches a `collection:hydrated` event after data loads. If you add new sliders, hook into that event (see `script.js`) to reinitialise any third-party widgets.

With this workflow, school administrators can keep announcements, admissions information, testimonials, and visual media fresh directly from Firebase while preserving the lightweight static deployment.
