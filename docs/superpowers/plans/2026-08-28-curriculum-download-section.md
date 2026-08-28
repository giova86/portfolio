# Curriculum Download Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Curriculum" section to `index.html` with EN/IT CV download buttons, reachable from a new nav link and from the existing hero "Download CV" button (which currently downloads the English PDF directly and must instead scroll to the new section).

**Architecture:** Single-file static site change — everything lives in `index.html` (one new `<section>`, one new nav `<li>`, one modified hero `<a>`, one small new CSS rule reusing the existing `.hobby-card`/`.cta-button` classes). No JS changes: the existing smooth-scroll handler in `static/js/shared.js` already handles any `href="#..."` anchor link, so the new nav link and the repointed hero button work with zero extra code.

**Tech Stack:** Plain HTML/CSS/vanilla JS, no build step. Verified by grepping the edited file and visually checking in the browser preview (`python -m http.server`).

## Global Constraints

- No build system — edit `index.html` directly, no new tooling.
- Follow the approved spec exactly: `docs/superpowers/specs/2026-08-28-curriculum-download-section-design.md`.
- Reuse existing classes (`.hobby-card`, `.hobby-icon`, `.section-title`, `.cta-button`, `.cta-button-red`, `.fade-in`) — do not invent new card styles.
- `static/CV_Giovanni_Bocchi_IT.pdf` will not exist after this plan — the user adds it later. The link must still be written exactly as specified; do not add existence checks or placeholder text about the missing file into the page itself.
- Keep the two CV buttons' `download`/`target="_blank"` attributes so behavior matches the current EN button (`index.html:953-954`).

---

### Task 1: Add nav link and repoint hero CTA

**Files:**
- Modify: `index.html:930-935` (nav-links `<ul>`)
- Modify: `index.html:952-954` (hero `cta-buttons-container`)

**Interfaces:**
- Consumes: existing smooth-scroll handler in `static/js/shared.js` (already wired to any in-page `<a href="#...">`; no signature to match, just needs a valid `href="#curriculum"` target, which Task 2 creates).
- Produces: nothing consumed by later tasks — this task's `href="#curriculum"` references a section ID that doesn't exist until Task 2 lands, so full manual verification happens after Task 2. This task's own step 2 only checks the HTML is correct, not that the scroll target resolves.

- [ ] **Step 1: Edit the nav links**

In `index.html`, current block (around line 929-936):

```html
            <ul class="nav-links" id="navLinks">
                <li><a href="#about">About me</a></li>
                <li><a href="#education">Education</a></li>
                <li><a href="#experience">Experiences</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#hobbies">Miscellanea</a></li>
                <li><a href="#contact">Contacts</a></li>
            </ul>
```

Change to:

```html
            <ul class="nav-links" id="navLinks">
                <li><a href="#about">About me</a></li>
                <li><a href="#education">Education</a></li>
                <li><a href="#experience">Experiences</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#hobbies">Miscellanea</a></li>
                <li><a href="#curriculum">Curriculum</a></li>
                <li><a href="#contact">Contacts</a></li>
            </ul>
```

- [ ] **Step 2: Edit the hero CTA button**

Current block (around line 951-955):

```html
            <div class="cta-buttons-container">
                <a href="#projects" class="cta-button">Explore my projects</a>
                <a href="static/CV_Giovanni_Bocchi_EN.pdf" target="_blank" class="cta-button-red"
                    download="CV_Giovanni_Bocchi_EN.pdf">Download CV</a>
            </div>
```

Change to:

```html
            <div class="cta-buttons-container">
                <a href="#projects" class="cta-button">Explore my projects</a>
                <a href="#curriculum" class="cta-button-red">Download CV</a>
            </div>
```

- [ ] **Step 3: Verify the edits with grep**

Run:

```bash
grep -n 'href="#curriculum"' index.html
```

Expected: two matches — one inside `nav-links` (`<li><a href="#curriculum">Curriculum</a></li>`), one in the hero `cta-buttons-container` (`<a href="#curriculum" class="cta-button-red">Download CV</a>`).

Run:

```bash
grep -n 'static/CV_Giovanni_Bocchi_EN.pdf' index.html
```

Expected: zero matches in the hero block for now (the only remaining reference to that path will be added back inside the new section in Task 2) — at this point in the plan it's fine if this returns zero matches total, since Task 2 hasn't run yet.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Point nav and hero CTA to new curriculum section"
```

---

### Task 2: Add the `#curriculum` section and its CSS

**Files:**
- Modify: `index.html` — insert new `<section id="curriculum">` between the end of `</section>` for `#hobbies` (`index.html:1939`, pre-Task-1 line numbers) and the start of `<section id="contact">`.
- Modify: `index.html` — insert `.curriculum-buttons` CSS rule near `.hobbies-grid` (`index.html:709-715`, pre-Task-1 line numbers) in the `<style>` block.

**Interfaces:**
- Consumes: `href="#curriculum"` targets created in Task 1 (this task supplies the matching `id="curriculum"`).
- Produces: `static/CV_Giovanni_Bocchi_EN.pdf` / `static/CV_Giovanni_Bocchi_IT.pdf` download links — nothing downstream in this plan consumes them (the IT file itself is out of scope, per spec).

- [ ] **Step 1: Add the `.curriculum-buttons` CSS rule**

In the `<style>` block, find the `.hobbies-grid` rule (originally around line 709-715):

```css
        /* Hobbies Section */
        .hobbies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
```

Add a new rule directly after it:

```css
        /* Curriculum Section */
        .curriculum-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: center;
        }
```

- [ ] **Step 2: Add the `#curriculum` section HTML**

Find the closing tag of `#hobbies` and the opening of `#contact` (originally around line 1939-1941):

```html
        </div>
    </section>

    <section id="contact">
```

Insert the new section between them:

```html
        </div>
    </section>

    <section id="curriculum">
        <h2 class="section-title fade-in">Curriculum</h2>
        <div class="hobbies-grid">
            <div class="hobby-card fade-in">
                <span class="hobby-icon">📄</span>
                <h3>Curriculum Vitae</h3>
                <p>Download my CV in English or Italian.</p>
                <div class="curriculum-buttons">
                    <a href="static/CV_Giovanni_Bocchi_EN.pdf" target="_blank"
                        download="CV_Giovanni_Bocchi_EN.pdf" class="cta-button">🇬🇧 Download CV (English)</a>
                    <a href="static/CV_Giovanni_Bocchi_IT.pdf" target="_blank"
                        download="CV_Giovanni_Bocchi_IT.pdf" class="cta-button-red">🇮🇹 Scarica CV (Italiano)</a>
                </div>
            </div>
        </div>
    </section>

    <section id="contact">
```

- [ ] **Step 3: Verify the edits with grep**

Run:

```bash
grep -n 'id="curriculum"\|curriculum-buttons\|CV_Giovanni_Bocchi_IT.pdf' index.html
```

Expected output includes:
- `.curriculum-buttons {` (CSS rule)
- `<section id="curriculum">`
- `class="curriculum-buttons"`
- the `CV_Giovanni_Bocchi_IT.pdf` href and download attribute

Run:

```bash
grep -c '<section id=' index.html
```

Expected: one more than before Task 2 (confirms the new `<section>` was added, not just text pasted elsewhere).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add curriculum download section"
```

---

### Task 3: Manual verification in the browser

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything from Task 1 and Task 2.
- Produces: nothing (terminal task).

- [ ] **Step 1: Start a local server**

```bash
python -m http.server 8000
```

- [ ] **Step 2: Open the site and check the nav**

Open `http://localhost:8000` in the browser preview. Confirm:
- The nav bar shows a "Curriculum" link between "Miscellanea" and "Contacts".
- Clicking it smooth-scrolls to the new section (between Hobbies and Contacts) and highlights/shows the "Curriculum Vitae" card with the 📄 icon.

- [ ] **Step 3: Check the hero button**

Scroll back to the top (`#home`). Confirm the hero's "Download CV" button no longer downloads a file directly — clicking it smooth-scrolls down to the `#curriculum` section instead.

- [ ] **Step 4: Check the two download buttons**

In the curriculum card, confirm:
- "🇬🇧 Download CV (English)" opens/downloads `static/CV_Giovanni_Bocchi_EN.pdf` (the file exists, so this must succeed).
- "🇮🇹 Scarica CV (Italiano)" points at `static/CV_Giovanni_Bocchi_IT.pdf` (this will 404 until the user adds the file — expected at this stage, not a bug).

- [ ] **Step 5: Check mobile layout**

Resize the browser preview to a narrow width (e.g. 375px). Confirm the two curriculum buttons wrap onto separate lines without overflowing the card, matching the wrap behavior already used by `.cta-buttons-container` in the hero.

- [ ] **Step 6: Stop the server**

Stop the `python -m http.server` process (e.g. Ctrl+C, or kill the background task).
