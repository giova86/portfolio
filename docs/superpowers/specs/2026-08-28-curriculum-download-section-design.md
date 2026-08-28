# Curriculum download section — design

## Goal

Add a "Curriculum" section to the home page (`index.html`) where the user
can download the CV in English or Italian. The existing hero "Download CV"
button currently links directly to the English PDF; it should instead
scroll to the new section.

## Changes

### 1. New section `#curriculum`

Placed after `#hobbies`, before `#contact`. Reuses the existing
`.hobbies-grid` / `.hobby-card` / `.hobby-icon` visual language (single
card, centered, icon + title + text + buttons) — no new card component.

```html
<section id="curriculum">
    <h2 class="section-title fade-in">Curriculum</h2>
    <div class="hobbies-grid">
        <div class="hobby-card fade-in">
            <span class="hobby-icon">📄</span>
            <h3>Curriculum Vitae</h3>
            <p>...</p>
            <div class="curriculum-buttons">
                <a href="static/CV_Giovanni_Bocchi_EN.pdf" target="_blank"
                   download="CV_Giovanni_Bocchi_EN.pdf" class="cta-button">🇬🇧 Download CV (English)</a>
                <a href="static/CV_Giovanni_Bocchi_IT.pdf" target="_blank"
                   download="CV_Giovanni_Bocchi_IT.pdf" class="cta-button-red">🇮🇹 Scarica CV (Italiano)</a>
            </div>
        </div>
    </div>
</section>
```

`static/CV_Giovanni_Bocchi_IT.pdf` does not exist yet — the user will add
it manually after this change ships. The link is left in place regardless
(same pattern already used for the existing EN file: a plain `<a download>`
with no existence check, consistent with the rest of the static site).

### 2. CSS: `.curriculum-buttons`

Small new rule in the `index.html` `<style>` block, near `.hobbies-grid`,
to lay the two buttons side by side inside the card with a gap, wrapping
on narrow screens:

```css
.curriculum-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
}
```

No changes to `.cta-button` / `.cta-button-red` / `.hobby-card` themselves.

### 3. Nav link

Add `<li><a href="#curriculum">Curriculum</a></li>` to `.nav-links` in
`<nav id="navbar">`, between "Miscellanea" and "Contacts" (matching the new
section's position in the page).

### 4. Hero CTA button

Change the existing hero button (currently a direct PDF download link) to
scroll to the new section instead:

```html
<a href="#curriculum" class="cta-button-red">Download CV</a>
```

No `target`/`download` attributes anymore — it's an in-page anchor link,
handled by the existing smooth-scroll JS in `static/js/shared.js` like
every other `nav-links`/`cta-buttons-container` anchor.

## Out of scope

- Producing or sourcing the Italian CV PDF itself.
- Any i18n/language-switcher for the rest of the site — this only adds two
  static download links.
