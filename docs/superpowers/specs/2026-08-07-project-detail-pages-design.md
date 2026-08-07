# Project detail pages — design

Date: 2026-08-07

## Problem

The portfolio's "Personal Projects" section shows 38 cards with only a title,
short description, tech tags, and a single external link (Live Demo/GitHub).
There is no way to show more detail about a specific project without leaving
the site. We want a dedicated detail page per project, reachable by clicking
its card, and a reusable template so new project pages are quick to author.

## Scope

In scope:
- Infrastructure to link each project card to a detail page.
- One reusable blank template file for authoring new project detail pages.
- One fully worked example page (Camera Bricks) to prove the flow end to end.
- Extracting the CSS/JS that both `index.html` and the new pages need into
  shared files, to avoid duplicating ~700 lines of CSS per project page.

Out of scope:
- Writing detail content for the other 37 projects — only the template + one
  worked example are produced now.
- An image lightbox/carousel library — the gallery is a plain grid where each
  thumbnail links to the full-size image in a new tab.
- Service worker changes — project pages are fetched over the network like
  any other same-origin asset (stale-while-revalidate, see below) but are not
  added to the precached app shell. Offline visits to a detail page that was
  never opened online will fall back to the cached `index.html` shell
  (existing service worker behavior, unchanged).
- A "Details" button — the whole card is clickable instead.

## Architecture

### New files

- `projects/_template.html` — blank template, duplicated per project.
- `projects/camera-bricks.html` — first real detail page, built from the
  template using the data already in the Camera Bricks card, used to verify
  the whole flow (styling, nav, slug matching, gallery layout).
- `static/css/shared.css` — CSS extracted from `index.html`'s `<style>`
  block: `:root` custom properties, reset/base rules, `#navbar` and
  `.nav-links`/`.nav-toggle`, `.bg-animation` (+ its `::after` grain overlay
  and `aurora` keyframes), `.card-button`, `footer`, and the
  `.fade-in`/`.visible` transition rules.
- `static/js/shared.js` — JS extracted from `index.html`'s `<script>` block:
  the mobile nav toggle, the anchor smooth-scroll handler, the navbar
  scroll-shrink effect, and the `.fade-in` `IntersectionObserver` wiring.
  (The animated background is pure CSS — a `.bg-animation` element with a
  gradient + grain overlay, no JS involved — so nothing to extract there
  beyond the CSS rule itself, which is part of `shared.css`.)

### Existing files touched

- `index.html`:
  - `<head>` gains `<link rel="stylesheet" href="static/css/shared.css">`.
  - Body gains `<script src="static/js/shared.js"></script>` before the
    existing inline `<script>` block; the extracted functions are removed
    from the inline block (the rest of the inline script — filtering,
    load-more, fade-in observer — stays as is).
  - The `<style>` block keeps only page-specific rules (hero, timeline,
    skills, projects grid, filters, contact, etc.) — the extracted rules are
    removed to avoid duplication.
  - Project-grid click delegation added to the existing
    `DOMContentLoaded` handler (see below).
- `CLAUDE.md`: architecture section updated to describe the new
  `projects/`, `static/css/`, and `static/js/` files, since "everything is
  self-contained in `index.html`" will no longer be fully accurate.

### Card → detail page linking

A single click listener is attached to `.projects-grid` (event delegation,
so it automatically covers all 38 existing cards and any future one added
to the grid — no per-card markup changes):

```js
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

document.querySelector('.projects-grid').addEventListener('click', (e) => {
  if (e.target.closest('a.card-button')) return; // let the external link work normally
  const card = e.target.closest('.project-card');
  if (!card) return;
  const title = card.querySelector('h3')?.textContent.trim();
  if (!title) return;
  window.location.href = `projects/${slugify(title)}.html`;
});
```

`.project-card` gets `cursor: pointer` in CSS as an affordance.

If `projects/<slug>.html` does not exist yet for a given card, the click
404s. This is expected while detail pages are added incrementally.

### Detail page template structure (`projects/_template.html`)

Top to bottom:

1. `<head>`: placeholder `<title>` and meta description, links to
   `static/css/shared.css` (relative path `../static/css/shared.css`) plus a
   small inline `<style>` block for the page-specific sections (hero banner,
   overview, features list, tech-stack grid, gallery grid) — same pattern as
   `index.html`, kept inline since these rules are unique to detail pages.
2. `.bg-animation` div (animated background, pure CSS via `shared.css`, no
   JS involved) and the same `<nav id="navbar">` as `index.html`, with the
   logo and all anchor links pointing to `../index.html#...` instead of
   `#...`.
3. `← Back to projects` link to `../index.html#projects`, right under the nav.
4. Hero section: cover image, `<h1>` title, one-line tagline, `.project-tech`
   tag row (reusing the existing tag styling), and one or more
   `.card-button`-styled action links (Live Demo / GitHub / etc.).
5. Overview section: multi-paragraph long-form description (placeholder
   paragraphs).
6. Key features section: `<ul>` bullet list (placeholder items).
7. Tech stack detail section: a small grid, one entry per technology with a
   name and a short "why/how it was used" note (placeholder entries).
8. Gallery section: responsive CSS grid of `<img>` thumbnails, each wrapped
   in `<a target="_blank">` pointing at the full-size image.
9. Same `<footer>` markup as `index.html`.
10. `<script src="../static/js/shared.js"></script>` at the end for the
    nav toggle/scroll behavior and the fade-in observer.

Every placeholder block is marked with an HTML comment (e.g.
`<!-- TODO: project title -->`) so it's obvious what to replace when
duplicating the template.

### Example page (`projects/camera-bricks.html`)

Duplicated from the template and filled in with:
- Title, tagline, tech tags, and Live Demo link — taken from the existing
  Camera Bricks card in `index.html`.
- Overview — expands the existing short card description into 2–3
  paragraphs.
- Features, tech-stack notes, and gallery — clearly marked
  `<!-- TODO -->` placeholders (this project has no extra written content or
  extra screenshots yet), but structurally complete so the page renders
  correctly and can be visually verified.

The filename `camera-bricks.html` must match what `slugify("Camera Bricks")`
produces, which is how we verify the click-through wiring end to end.

## Verification

- Serve the site locally, click the Camera Bricks card from the home page,
  confirm it navigates to `projects/camera-bricks.html` and the page renders
  with working nav, animated background, back link, and gallery placeholders.
- Click a card for a project that has no detail page yet, confirm it 404s
  (expected, not a regression) — sanity check that other cards remain
  functional (external `card-button` links still work, filters/search/load
  more are unaffected).
- Confirm `index.html` still renders identically after the CSS/JS extraction
  (visual diff of nav, animated background, buttons, footer).
