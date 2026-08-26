# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a single-file static personal portfolio website for Giovanni Bocchi, Ph.D. — a Data Scientist and AI Researcher. There is no build system, package manager, or framework. The entire site lives in `index.html`, with images and a PDF CV in `static/`.

## Running locally

```bash
# Python (simplest)
python -m http.server 8000

# Node.js
npx serve .
```

Open `http://localhost:8000` in a browser. There is no build step.

## Architecture

`index.html` holds the single-page site. `static/css/`, `static/js/`, and
`projects/` hold the files shared with (or making up) the project detail
pages.

- **`static/css/shared.css`** — CSS shared by every page: `:root` custom
  properties (`--brand`, `--bg`, `--gradient`, etc.), reset, the animated
  background, nav, `.card-button`, footer, and `.fade-in` transitions.
  Site-wide theme changes (colors, fonts) go here. The footer is
  `position: fixed` at the viewport bottom from 769px up (always visible),
  and `position: sticky; top: 100vh` below that — anchored to the bottom on
  short pages, in normal flow on long ones. Its height is `--footer-h`,
  which desktop also uses as `body`'s `padding-bottom` so content never
  hides under the fixed strip; change the two together. Do **not** make
  `body` a flex container to anchor the footer: several body-level blocks
  center with `max-width` + `margin: … auto` and no `width`, and as flex
  items they collapse to their content width.
- **`static/css/project-detail.css`** — CSS used only by `projects/*.html`:
  hero banner, overview/features/tech-stack/gallery sections. Not linked
  from `index.html`.
- **`index.html` `<style>` block** — CSS specific to the single-page site:
  hero, timeline, skills, projects grid/filters, contact, etc.
- **`index.html` body** — sequential sections: `#home`, `#about`,
  `#education`, `#experience`, `#skills`, `#projects`, `#certifications`,
  `#hobbies`, `#contact`, then `<footer>`.
- **`static/js/shared.js`** — mobile nav toggle, in-page smooth scroll,
  navbar scroll-shrink, and the `.fade-in` `IntersectionObserver`, shared
  by every page.
- **`index.html` `<script>` block** at the bottom — page-specific vanilla
  JS: service worker registration, project search/filter/pagination, and
  the project-card → detail-page click-through.
- **`projects/<slug>.html`** — one static detail page per project, linked
  automatically from its home-page card (see "Adding a project" below).
  `projects/_template.html` is the starting point for a new one.

### Key JS behaviors

- **Animated background**: pure CSS (`.bg-animation` in `static/css/shared.css`) — a gradient + grain overlay, no JS involved.
- **Scroll animations**: `IntersectionObserver` adds `.visible` to `.fade-in` elements when they enter the viewport; CSS handles the opacity/transform transition.
- **Timeline**: Education and experience use `.timeline-left` / `.timeline-right` alternating layout with a vertical `::after` line. On mobile (`<768px`) the line and dots are hidden and all items go full-width.
- **Project filter**: Built dynamically on `DOMContentLoaded` — scans all `.tech-tag` elements in `.projects-grid`, collects unique values, renders `<button class="filter-btn">` into `#project-filters`, then toggles `card.style.display` on click. Adding a project card with new tech tags automatically adds a new filter button.

### Adding a project

Copy an existing `.project-card` div inside `.projects-grid`. The filter button for any new `<span class="tech-tag">` is generated automatically — no JS changes needed.

Clicking a card navigates to `projects/<slug>.html`, where `<slug>` is the
card's `<h3>` title lowercased, with accents stripped and non-alphanumeric
runs turned into single hyphens (e.g. "Camera Bricks" → `camera-bricks.html`).
To give a project a detail page, copy `projects/_template.html` to
`projects/<slug>.html` (the slug must match) and fill in the `<!-- TODO -->`
placeholders. Until that file exists, clicking the card 404s.

### Adding a project detail gallery

Screenshots for a project's detail-page gallery live in
`static/gallery/<slug>/`, one subfolder per project, named to match
`projects/<slug>.html`. Keep only screenshots that show the app/tool in
use — skip icons, build artifacts, and design source files (`.psd`, etc.).

The gallery is populated automatically at runtime by
`static/js/project-gallery.js`, which reads the file list from
`window.__galleryImages[<slug>]` (set by
`static/gallery/<slug>/images.js`, loaded via a plain `<script>` tag
right before `project-gallery.js`). A manifest loaded as a `<script>`
rather than `fetch()`-ed is deliberate: `fetch()` of a local JSON file
fails under `file://` (no build step / no server means pages are often
opened directly), while a `<script src>` tag still works. The detail
page itself only needs an empty container plus the two script tags:

```html
<div class="project-gallery" data-gallery="<slug>"></div>
...
<script src="../static/gallery/<slug>/images.js"></script>
<script src="../static/js/project-gallery.js"></script>
```

**After adding, removing, or renaming images in a gallery folder**, regenerate
the manifests:

```bash
python3 scripts/generate_gallery_manifests.py
```

This scans every `static/gallery/<slug>/` folder and rewrites its
`images.js` (sorted list of image filenames). If a folder is empty (or
its manifest fails to load), the whole Gallery section is hidden on that
page. The grid layout and hover zoom are handled by `.project-gallery`
in `project-detail.css`.

### Adding a timeline entry

Add a `.timeline-item` with alternating `.timeline-left` / `.timeline-right` class inside the relevant `.timeline` container. The vertical line is drawn by CSS `::after` on the `.timeline` parent.

## Assets

- `static/` — PNG screenshots for project cards, profile photo (`gbocchi3.png`), and the CV PDF (`CV_Giovanni_Bocchi_EN.pdf`).
- `static/gallery/<slug>/` — per-project detail-page gallery screenshots plus a generated `images.js` manifest, see "Adding a project detail gallery" below.
- `static/js/project-gallery.js` — reads `window.__galleryImages[<slug>]` and renders the thumbnails; linked only from `projects/*.html`.
- `scripts/generate_gallery_manifests.py` — regenerates every gallery's `images.js` from the files present on disk.
- `static/css/` — `shared.css` (every page) and `project-detail.css` (`projects/*.html` only).
- `static/js/` — `shared.js` (every page).
- Project card images are referenced directly in HTML `src` attributes; keep filenames lowercase with no spaces.
