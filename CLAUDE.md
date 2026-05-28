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

Everything is self-contained in `index.html`:

- **`<style>` block** — all CSS, using CSS custom properties (`--primary-color`, `--secondary-color`, `--accent-color`, `--card-bg`, `--gradient`, etc.) defined on `:root`. Theme changes go here.
- **HTML body** — sequential sections: `#home`, `#about`, `#education`, `#experience`, `#skills`, `#projects`, `#certifications`, `#hobbies`, `#contact`, then `<footer>`.
- **`<script>` block** at the bottom — all vanilla JavaScript with no external dependencies.

### Key JS behaviors

- **Particle background**: `createParticles()` generates 50 animated `<div class="particle">` elements into `#bgAnimation` on load.
- **Scroll animations**: `IntersectionObserver` adds `.visible` to `.fade-in` elements when they enter the viewport; CSS handles the opacity/transform transition.
- **Timeline**: Education and experience use `.timeline-left` / `.timeline-right` alternating layout with a vertical `::after` line. On mobile (`<768px`) the line and dots are hidden and all items go full-width.
- **Project filter**: Built dynamically on `DOMContentLoaded` — scans all `.tech-tag` elements in `.projects-grid`, collects unique values, renders `<button class="filter-btn">` into `#project-filters`, then toggles `card.style.display` on click. Adding a project card with new tech tags automatically adds a new filter button.

### Adding a project

Copy an existing `.project-card` div inside `.projects-grid`. The filter button for any new `<span class="tech-tag">` is generated automatically — no JS changes needed.

### Adding a timeline entry

Add a `.timeline-item` with alternating `.timeline-left` / `.timeline-right` class inside the relevant `.timeline` container. The vertical line is drawn by CSS `::after` on the `.timeline` parent.

## Assets

- `static/` — PNG screenshots for project cards, profile photo (`gbocchi3.png`), and the CV PDF (`CV_Giovanni_Bocchi_EN.pdf`).
- Project card images are referenced directly in HTML `src` attributes; keep filenames lowercase with no spaces.
