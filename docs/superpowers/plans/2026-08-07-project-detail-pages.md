# Project Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each project a dedicated, linkable detail page reachable by clicking its card on the home page, plus a reusable blank template for authoring new ones.

**Architecture:** Extract the CSS/JS that both `index.html` and the new pages need (variables, nav, animated background, `.card-button`, footer, fade-in) into `static/css/shared.css` / `static/js/shared.js`. Add a delegated click handler on `.projects-grid` that computes a slug from each card's title and navigates to `projects/<slug>.html`. Ship `projects/_template.html` (blank) and `projects/camera-bricks.html` (filled worked example) as static HTML files with no build step, matching the rest of the site.

**Tech Stack:** Plain HTML/CSS/vanilla JS, no build system, no dependencies. Reference: [docs/superpowers/specs/2026-08-07-project-detail-pages-design.md](../specs/2026-08-07-project-detail-pages-design.md).

## Global Constraints

- No build system, no bundler, no new JS/CSS dependencies — plain static files only.
- New filenames lowercase, no spaces (existing repo convention for `static/`).
- `<html lang="it">` on every new page, matching `index.html`.
- Do not modify `service-worker.js` or `manifest.webmanifest` — offline caching behavior for new pages is an accepted known limitation (see spec's Out of scope).
- No image lightbox/carousel library — gallery thumbnails link to the full-size image in a new tab.
- Only `projects/camera-bricks.html` gets real content; no other project detail pages are authored in this plan.

---

### Task 1: Extract shared CSS into `static/css/shared.css`

**Files:**
- Create: `static/css/shared.css`
- Modify: `index.html` (head `<link>`, and remove the moved rules from the inline `<style>` block)

**Interfaces:**
- Produces: a stylesheet at `static/css/shared.css` (relative path from `projects/*.html` is `../static/css/shared.css`) containing `:root` variables, reset, `body`/`::selection`, `.bg-animation` (+ `::after`, `@keyframes aurora`, reduced-motion), `nav`/`.nav-container`/`.logo`/`.nav-links`/`.nav-toggle` (+ the `@media (max-width: 768px)` mobile-nav rules), `.card-button` (+ `:hover`), `footer`, and `@keyframes fadeInUp`/`.fade-in`/`.fade-in.visible`. Later tasks (3, 4, 5) rely on all of these class names/selectors existing in this one file.

- [ ] **Step 1: Confirm the exact source blocks are still present (fails loudly if the file has drifted)**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 - <<'EOF'
with open('index.html', encoding='utf-8') as f:
    content = f.read()

blocks = [
    "        /* Reset e Variabili CSS */\n        * {",
    "        .card-button {\n            display: inline-block;",
    "        /* Footer */\n        footer {",
    "        /* Animations */\n        @keyframes fadeInUp {",
    "            .nav-toggle {\n                display: flex;\n            }\n\n            .nav-links {\n                position: fixed;",
]
for b in blocks:
    assert b in content, f"MISSING: {b[:50]!r}"
print("All source blocks present.")
EOF
```
Expected: `All source blocks present.` (if this fails, stop and re-read `index.html` — the plan's assumptions about line content are stale).

- [ ] **Step 2: Create `static/css/` and write `shared.css`**

Run:
```bash
mkdir -p /Users/gbocchi/GitHub/dev_pers/portfolio/static/css
```

Create `static/css/shared.css` with this exact content:

```css
/* Shared styles used by index.html and projects/*.html */

/* Reset e Variabili CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* --- Surfaces --- */
    --bg: #0a0e16;
    --bg-darker: #070a11;
    --bg-elev: rgba(255, 255, 255, 0.035);
    --bg-elev-2: rgba(255, 255, 255, 0.06);
    --border: rgba(255, 255, 255, 0.09);
    --border-strong: rgba(56, 189, 248, 0.45);

    /* --- Text --- */
    --text: #eef2f7;
    --text-muted: #9aa7b8;
    --text-faint: #6b7787;

    /* --- Brand --- */
    --brand: #38bdf8;
    --brand-2: #5b8def;
    --accent: #fb7185;
    --gradient: linear-gradient(135deg, var(--brand), var(--brand-2));
    --gradient-text: linear-gradient(120deg, #7dd3fc, #38bdf8 55%, #818cf8);

    /* --- Typography --- */
    --font-display: 'Space Grotesk', 'Segoe UI', sans-serif;
    --font-body: 'Inter', 'Segoe UI', Tahoma, sans-serif;
    --fs-h1: clamp(2.6rem, 6vw, 4.5rem);
    --fs-section: clamp(2rem, 4vw, 2.75rem);
    --fs-card-title: clamp(1.1rem, 2vw, 1.3rem);
    --fs-body: clamp(1rem, 1.5vw, 1.08rem);

    /* --- System --- */
    --radius: 14px;
    --radius-lg: 22px;
    --shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 18px 45px rgba(56, 189, 248, 0.18);
    --maxw: 1200px;
    --space-section: clamp(4rem, 8vw, 7rem);

    /* Back-compat aliases (legacy var names still referenced in places) */
    --primary-color: var(--brand);
    --secondary-color: var(--brand-2);
    --accent-color: var(--accent);
    --bg-dark: var(--bg);
    --text-light: var(--text);
    --text-gray: var(--text-muted);
    --card-bg: var(--bg-elev);
    --gradient2: var(--gradient-text);
}

body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    line-height: 1.65;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}

::selection {
    background: rgba(56, 189, 248, 0.25);
    color: #fff;
}

/* Animated background — soft aurora glow + subtle grain */
.bg-animation {
    position: fixed;
    inset: 0;
    z-index: -2;
    background:
        radial-gradient(ellipse 80% 50% at 15% 0%, rgba(56, 189, 248, 0.13), transparent 60%),
        radial-gradient(ellipse 70% 50% at 85% 20%, rgba(91, 141, 239, 0.12), transparent 55%),
        radial-gradient(ellipse 60% 45% at 50% 100%, rgba(129, 140, 248, 0.1), transparent 60%);
    animation: aurora 22s ease-in-out infinite alternate;
}

.bg-animation::after {
    /* fine grain overlay */
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: 0.5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
}

@keyframes aurora {
    0% {
        transform: translate3d(0, 0, 0) scale(1);
    }

    100% {
        transform: translate3d(0, -2%, 0) scale(1.08);
    }
}

@media (prefers-reduced-motion: reduce) {
    .bg-animation {
        animation: none;
    }
}

/* Navigation */
nav {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(10, 14, 22, 0.55);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    z-index: 1000;
    padding: 1rem 0;
    border-bottom: 1px solid transparent;
    transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

nav.scrolled {
    background: rgba(10, 14, 22, 0.85);
    border-bottom-color: var(--border);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.nav-container {
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2.5rem;
}

.logo {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-decoration: none;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
}

.nav-links a:hover {
    color: var(--text);
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 0;
    height: 2px;
    border-radius: 2px;
    background: var(--gradient);
    transition: width 0.3s ease;
}

.nav-links a:hover::after {
    width: 100%;
}

/* Hamburger (mobile) */
.nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.4rem;
    flex-direction: column;
    gap: 5px;
    z-index: 1100;
}

.nav-toggle span {
    display: block;
    width: 24px;
    height: 2px;
    border-radius: 2px;
    background: var(--text);
    transition: transform 0.3s ease, opacity 0.3s ease;
}

nav.open .nav-toggle span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}

nav.open .nav-toggle span:nth-child(2) {
    opacity: 0;
}

nav.open .nav-toggle span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
    .nav-toggle {
        display: flex;
    }

    .nav-links {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: min(75vw, 300px);
        flex-direction: column;
        justify-content: center;
        gap: 1.8rem;
        padding: 2rem;
        background: rgba(10, 14, 22, 0.97);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-left: 1px solid var(--border);
        transform: translateX(100%);
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    nav.open .nav-links {
        transform: translateX(0);
    }

    .nav-links a {
        font-size: 1.15rem;
    }
}

/* New button style for projects/hobbies */
.card-button {
    display: inline-block;
    padding: 0.6rem 1.3rem;
    background: var(--bg-elev-2);
    border: 1px solid var(--border);
    border-radius: 50px;
    color: var(--text);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
    margin-top: 1rem;
    margin-right: 0.5rem;
    align-self: flex-start;
}

.card-button:hover {
    background: var(--gradient);
    color: #06121c;
    border-color: transparent;
    transform: translateY(-2px);
}

/* Footer */
footer {
    background: var(--bg-darker);
    text-align: center;
    padding: 2.5rem 1.5rem;
    border-top: 1px solid var(--border);
    color: var(--text-faint);
    font-size: 0.9rem;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
```

- [ ] **Step 3: Remove the now-duplicated rules from `index.html` and link the new stylesheet**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 - <<'EOF'
with open('index.html', encoding='utf-8') as f:
    content = f.read()

# 1. Link the shared stylesheet, right after the Google Fonts <link>.
fonts_anchor = '''    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <style>'''
fonts_replacement = '''    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Shared site styles (variables, nav, buttons, footer, animations) -->
    <link rel="stylesheet" href="static/css/shared.css">
    <style>'''
assert content.count(fonts_anchor) == 1
content = content.replace(fonts_anchor, fonts_replacement)

# 2. Remove reset/vars/body/selection/bg-animation/nav/hamburger block (now in shared.css).
reset_through_hamburger = '''        /* Reset e Variabili CSS */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            /* --- Surfaces --- */
            --bg: #0a0e16;
            --bg-darker: #070a11;
            --bg-elev: rgba(255, 255, 255, 0.035);
            --bg-elev-2: rgba(255, 255, 255, 0.06);
            --border: rgba(255, 255, 255, 0.09);
            --border-strong: rgba(56, 189, 248, 0.45);

            /* --- Text --- */
            --text: #eef2f7;
            --text-muted: #9aa7b8;
            --text-faint: #6b7787;

            /* --- Brand --- */
            --brand: #38bdf8;
            --brand-2: #5b8def;
            --accent: #fb7185;
            --gradient: linear-gradient(135deg, var(--brand), var(--brand-2));
            --gradient-text: linear-gradient(120deg, #7dd3fc, #38bdf8 55%, #818cf8);

            /* --- Typography --- */
            --font-display: 'Space Grotesk', 'Segoe UI', sans-serif;
            --font-body: 'Inter', 'Segoe UI', Tahoma, sans-serif;
            --fs-h1: clamp(2.6rem, 6vw, 4.5rem);
            --fs-section: clamp(2rem, 4vw, 2.75rem);
            --fs-card-title: clamp(1.1rem, 2vw, 1.3rem);
            --fs-body: clamp(1rem, 1.5vw, 1.08rem);

            /* --- System --- */
            --radius: 14px;
            --radius-lg: 22px;
            --shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
            --shadow-glow: 0 18px 45px rgba(56, 189, 248, 0.18);
            --maxw: 1200px;
            --space-section: clamp(4rem, 8vw, 7rem);

            /* Back-compat aliases (legacy var names still referenced in places) */
            --primary-color: var(--brand);
            --secondary-color: var(--brand-2);
            --accent-color: var(--accent);
            --bg-dark: var(--bg);
            --text-light: var(--text);
            --text-gray: var(--text-muted);
            --card-bg: var(--bg-elev);
            --gradient2: var(--gradient-text);
        }

        body {
            font-family: var(--font-body);
            background: var(--bg);
            color: var(--text);
            line-height: 1.65;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }

        ::selection {
            background: rgba(56, 189, 248, 0.25);
            color: #fff;
        }

        /* Animated background — soft aurora glow + subtle grain */
        .bg-animation {
            position: fixed;
            inset: 0;
            z-index: -2;
            background:
                radial-gradient(ellipse 80% 50% at 15% 0%, rgba(56, 189, 248, 0.13), transparent 60%),
                radial-gradient(ellipse 70% 50% at 85% 20%, rgba(91, 141, 239, 0.12), transparent 55%),
                radial-gradient(ellipse 60% 45% at 50% 100%, rgba(129, 140, 248, 0.1), transparent 60%);
            animation: aurora 22s ease-in-out infinite alternate;
        }

        .bg-animation::after {
            /* fine grain overlay */
            content: '';
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: 0.5;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }

        @keyframes aurora {
            0% {
                transform: translate3d(0, 0, 0) scale(1);
            }

            100% {
                transform: translate3d(0, -2%, 0) scale(1.08);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .bg-animation {
                animation: none;
            }
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(10, 14, 22, 0.55);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 1000;
            padding: 1rem 0;
            border-bottom: 1px solid transparent;
            transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        nav.scrolled {
            background: rgba(10, 14, 22, 0.85);
            border-bottom-color: var(--border);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
        }

        .nav-container {
            width: 100%;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2.5rem;
        }

        .logo {
            font-family: var(--font-display);
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            text-decoration: none;
            background: var(--gradient-text);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.3s ease;
            position: relative;
        }

        .nav-links a:hover {
            color: var(--text);
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 0;
            width: 0;
            height: 2px;
            border-radius: 2px;
            background: var(--gradient);
            transition: width 0.3s ease;
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        /* Hamburger (mobile) */
        .nav-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.4rem;
            flex-direction: column;
            gap: 5px;
            z-index: 1100;
        }

        .nav-toggle span {
            display: block;
            width: 24px;
            height: 2px;
            border-radius: 2px;
            background: var(--text);
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        nav.open .nav-toggle span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }

        nav.open .nav-toggle span:nth-child(2) {
            opacity: 0;
        }

        nav.open .nav-toggle span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }

        /* Hero Section */'''
assert content.count(reset_through_hamburger) == 1, "reset_through_hamburger block not found or not unique"
content = content.replace(reset_through_hamburger, '        /* Hero Section */')

# 3. Remove .card-button / .card-button:hover (keep .card-button-center, it's page-specific).
card_button_block = '''        /* New button style for projects/hobbies */
        .card-button {
            display: inline-block;
            padding: 0.6rem 1.3rem;
            background: var(--bg-elev-2);
            border: 1px solid var(--border);
            border-radius: 50px;
            color: var(--text);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.85rem;
            transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
            margin-top: 1rem;
            margin-right: 0.5rem;
            align-self: flex-start;
        }

        .card-button:hover {
            background: var(--gradient);
            color: #06121c;
            border-color: transparent;
            transform: translateY(-2px);
        }

        /* Centered card button (used in hobby cards) */'''
assert content.count(card_button_block) == 1, "card_button_block not found or not unique"
content = content.replace(card_button_block, '        /* Centered card button (used in hobby cards) */')

# 4. Remove footer + fadeInUp/.fade-in/.fade-in.visible (now in shared.css).
footer_and_animations = '''        /* Footer */
        footer {
            background: var(--bg-darker);
            text-align: center;
            padding: 2.5rem 1.5rem;
            border-top: 1px solid var(--border);
            color: var(--text-faint);
            font-size: 0.9rem;
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Timeline Styles */'''
assert content.count(footer_and_animations) == 1, "footer_and_animations block not found or not unique"
content = content.replace(footer_and_animations, '        /* Timeline Styles */')

# 5. Remove the mobile nav rules from the responsive-timeline media query
#    (the rest of that media query — timeline/hobbies/hero-photo rules — stays).
mobile_nav_rules = '''            .nav-toggle {
                display: flex;
            }

            .nav-links {
                position: fixed;
                top: 0;
                right: 0;
                height: 100vh;
                width: min(75vw, 300px);
                flex-direction: column;
                justify-content: center;
                gap: 1.8rem;
                padding: 2rem;
                background: rgba(10, 14, 22, 0.97);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-left: 1px solid var(--border);
                transform: translateX(100%);
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            }

            nav.open .nav-links {
                transform: translateX(0);
            }

            .nav-links a {
                font-size: 1.15rem;
            }

            /* Remove timeline line and circles for mobile */'''
assert content.count(mobile_nav_rules) == 1, "mobile_nav_rules block not found or not unique"
content = content.replace(mobile_nav_rules, '            /* Remove timeline line and circles for mobile */')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html updated.")
EOF
```
Expected: `index.html updated.`

- [ ] **Step 4: Verify no duplicate/orphaned rules and the file still parses as balanced HTML**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('index.html', encoding='utf-8').read()
assert content.count(':root {') == 0, 'variables should only live in shared.css now'
assert content.count('.card-button {') == 1, 'only the mobile (max-width: 768px) padding override should remain — the base rule moved to shared.css'
assert content.count('footer {') == 0
assert 'static/css/shared.css' in content
assert content.count('<style>') == 1 and content.count('</style>') == 1
print('OK:', content.count('{'), 'open braces,', content.count('}'), 'close braces in <style> region (sanity, not exact due to template literals elsewhere)')
"
grep -c "^        /\* Hero Section \*/" index.html
```
Expected: no assertion errors, and the grep prints `1`.

- [ ] **Step 5: Visual check in the browser**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -m http.server 8123 >/tmp/portfolio_server.log 2>&1 &
sleep 1
```
Open `http://localhost:8123` in the browser tool, confirm: nav bar, animated background, hero section, project cards with `.card-button` styling, and the footer all look identical to before the extraction (same colors, same layout). Check the browser console for 404s or CSS errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add static/css/shared.css index.html
git commit -m "$(cat <<'EOF'
Extract shared CSS into static/css/shared.css

Pulls variables, reset, nav, animated background, card-button, footer,
and fade-in rules out of index.html so project detail pages can reuse
them without duplicating ~250 lines of CSS per page.
EOF
)"
```

---

### Task 2: Extract shared JS into `static/js/shared.js`

**Files:**
- Create: `static/js/shared.js`
- Modify: `index.html` (add `<script src="static/js/shared.js">`, remove the moved code from the inline `<script>` block)

**Interfaces:**
- Consumes (from Task 1 / existing markup): elements with `id="navbar"`, `id="navToggle"`, `id="navLinks"`, and any elements with class `.fade-in`.
- Produces: on `DOMContentLoaded`, wires up mobile nav toggle, in-page anchor smooth-scroll, navbar scroll-shrink, and a `.fade-in` → `.visible` `IntersectionObserver`. Task 3/4 templates depend on this running via `<script src="../static/js/shared.js">`.

- [ ] **Step 1: Confirm the exact source block is still present**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('index.html', encoding='utf-8').read()
assert '// Mobile navigation toggle' in content
assert '// Intersection Observer for fade-in animations' in content
print('Source block present.')
"
```
Expected: `Source block present.`

- [ ] **Step 2: Create `static/js/` and write `shared.js`**

Run:
```bash
mkdir -p /Users/gbocchi/GitHub/dev_pers/portfolio/static/js
```

Create `static/js/shared.js` with this exact content:

```js
// Shared behavior used by index.html and projects/*.html:
// mobile nav toggle, in-page smooth scroll, navbar scroll-shrink,
// and the .fade-in IntersectionObserver.
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Smooth scrolling for in-page anchor links (also closes the mobile menu)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            navbar.classList.remove('open');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
});
```

- [ ] **Step 3: Remove the moved code from `index.html` and load the shared script**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 - <<'EOF'
with open('index.html', encoding='utf-8') as f:
    content = f.read()

old = '''    <script>
        // Register the service worker (PWA: installable + offline)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js').catch((err) => {
                    console.warn('Service worker registration failed:', err);
                });
            });
        }

        // Mobile navigation toggle
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const isOpen = navbar.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', isOpen);
            });
        }

        // Smooth scrolling for navigation links (also closes the mobile menu)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                navbar.classList.remove('open');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });


        // Initialize effects'''

new = '''    <script src="static/js/shared.js"></script>
    <script>
        // Register the service worker (PWA: installable + offline)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js').catch((err) => {
                    console.warn('Service worker registration failed:', err);
                });
            });
        }

        // Initialize effects'''

assert content.count(old) == 1, "inline script block not found or not unique"
content = content.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html updated.")
EOF
```
Expected: `index.html updated.`

- [ ] **Step 4: Verify**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('index.html', encoding='utf-8').read()
assert 'static/js/shared.js' in content
assert content.count('IntersectionObserver') == 0, 'the fade-in observer should have moved entirely to shared.js'
assert 'const navLinks = document.getElementById' not in content
print('OK')
"
```
Expected: `OK`

- [ ] **Step 5: Visual/functional check in the browser**

With the local server still running (`http://localhost:8123`, restart it if needed with the Task 1 Step 5 command):
- Confirm elements fade in on scroll (About/Education/etc. sections).
- Resize to a mobile width, click the hamburger, confirm the mobile nav opens/closes.
- Confirm clicking a nav link (e.g. "Projects") smooth-scrolls to that section.
- Check browser console for JS errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add static/js/shared.js index.html
git commit -m "$(cat <<'EOF'
Extract shared JS into static/js/shared.js

Nav toggle, smooth-scroll, scroll-shrink, and the fade-in observer are
needed by both index.html and the new project detail pages.
EOF
)"
```

---

### Task 3: Create the blank project template (`projects/_template.html`)

**Files:**
- Create: `projects/_template.html`

**Interfaces:**
- Consumes: `static/css/shared.css` and `static/js/shared.js` (from Tasks 1–2), loaded via `../static/...` relative paths.
- Produces: the file Task 4 duplicates, and the file a human author duplicates for every future project. Section class names (`.project-hero`, `.project-tagline`, `.project-tech`, `.tech-tag`, `.project-links`, `.project-section`, `.project-features`, `.project-stack-grid`, `.project-stack-item`, `.project-gallery`, `.project-detail-back`) are defined here and must be reused as-is by Task 4.

- [ ] **Step 1: Create the `projects/` directory**

Run:
```bash
mkdir -p /Users/gbocchi/GitHub/dev_pers/portfolio/projects
```

- [ ] **Step 2: Write `projects/_template.html`**

Create `projects/_template.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- TODO: project title --> — Giovanni Bocchi</title>
    <meta name="description" content="<!-- TODO: one-sentence project description for search engines -->">
    <meta name="author" content="Giovanni Bocchi">

    <!-- Open Graph / social -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="<!-- TODO: project title --> — Giovanni Bocchi">
    <meta property="og:description" content="<!-- TODO: one-sentence project description -->">
    <meta property="og:image" content="../static/<!-- TODO: cover-image filename -->">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<!-- TODO: project title --> — Giovanni Bocchi">
    <meta name="twitter:description" content="<!-- TODO: one-sentence project description -->">
    <meta name="twitter:image" content="../static/<!-- TODO: cover-image filename -->">

    <!-- Favicon (inline SVG) -->
    <link rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230a0e16'/><text x='50' y='70' font-size='58' font-family='monospace' font-weight='700' text-anchor='middle' fill='%2338bdf8'>G</text></svg>">

    <!-- PWA -->
    <link rel="manifest" href="../manifest.webmanifest">
    <meta name="theme-color" content="#0a0e16">
    <link rel="apple-touch-icon" href="../static/icons/apple-touch-icon.png">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="G. Bocchi">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Shared site styles (variables, nav, buttons, footer, animations) -->
    <link rel="stylesheet" href="../static/css/shared.css">
    <style>
        /* Page-specific styles for project detail pages */

        .project-detail-back {
            position: relative;
            z-index: 1;
            display: block;
            max-width: var(--maxw);
            margin: 6.5rem auto 0;
            padding: 0 2.5rem;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .project-detail-back:hover {
            color: var(--brand);
        }

        .project-hero {
            max-width: var(--maxw);
            margin: 2rem auto 0;
            padding: 0 2.5rem 3rem;
            display: grid;
            gap: 2rem;
        }

        .project-hero-image {
            width: 100%;
            max-height: 420px;
            object-fit: cover;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }

        .project-hero h1 {
            font-family: var(--font-display);
            font-size: var(--fs-section);
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .project-tagline {
            color: var(--text-muted);
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .tech-tag {
            background: rgba(56, 189, 248, 0.1);
            color: var(--brand);
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.78rem;
            font-weight: 500;
            border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .project-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .project-section {
            max-width: var(--maxw);
            margin: 0 auto;
            padding: 0 2.5rem 3rem;
        }

        .project-section h2 {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .project-section p {
            color: var(--text-muted);
            margin-bottom: 1rem;
            line-height: 1.7;
        }

        .project-features {
            list-style: none;
            display: grid;
            gap: 0.75rem;
        }

        .project-features li {
            color: var(--text-muted);
            padding-left: 1.5rem;
            position: relative;
            line-height: 1.6;
        }

        .project-features li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.55rem;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--gradient);
        }

        .project-stack-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.25rem;
        }

        .project-stack-item {
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.25rem;
        }

        .project-stack-item h3 {
            font-family: var(--font-display);
            font-size: 1rem;
            color: var(--brand);
            margin-bottom: 0.4rem;
        }

        .project-stack-item p {
            font-size: 0.92rem;
            margin-bottom: 0;
        }

        .project-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
        }

        .project-gallery a {
            display: block;
            border-radius: var(--radius);
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .project-gallery img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }

        .project-gallery a:hover img {
            transform: scale(1.05);
        }

        @media (max-width: 768px) {
            .project-hero {
                padding: 0 1.25rem 2rem;
            }

            .project-section {
                padding: 0 1.25rem 2rem;
            }

            .project-detail-back {
                padding: 0 1.25rem;
            }
        }
    </style>
</head>

<body>
    <div class="bg-animation" id="bgAnimation"></div>

    <nav id="navbar">
        <div class="nav-container">
            <a href="../index.html#home" class="logo">Giovanni Bocchi</a>
            <ul class="nav-links" id="navLinks">
                <li><a href="../index.html#about">About me</a></li>
                <li><a href="../index.html#education">Education</a></li>
                <li><a href="../index.html#experience">Experiences</a></li>
                <li><a href="../index.html#projects">Projects</a></li>
                <li><a href="../index.html#hobbies">Miscellanea</a></li>
                <li><a href="../index.html#contact">Contacts</a></li>
            </ul>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <a href="../index.html#projects" class="project-detail-back fade-in">← Back to projects</a>

    <section class="project-hero fade-in">
        <!-- TODO: cover image -->
        <img src="../static/PLACEHOLDER.png" alt="<!-- TODO: alt text -->" class="project-hero-image">
        <div>
            <!-- TODO: project title (must match the h1 used to derive the slug: lowercase, accents stripped, spaces -> hyphens) -->
            <h1>Project Title</h1>
            <!-- TODO: one-line tagline -->
            <p class="project-tagline">One-line tagline describing what the project does.</p>
            <!-- TODO: tech tags, copy from the project card on the home page -->
            <div class="project-tech">
                <span class="tech-tag">Tech 1</span>
                <span class="tech-tag">Tech 2</span>
            </div>
            <!-- TODO: action links, copy from the project card (add more <a> tags if there's more than one) -->
            <div class="project-links">
                <a href="#" class="card-button" target="_blank">Live Demo</a>
            </div>
        </div>
    </section>

    <section class="project-section fade-in">
        <h2>Overview</h2>
        <!-- TODO: expand the short card description into 2-3 paragraphs -->
        <p>Paragraph one — what the project is and why it was built.</p>
        <p>Paragraph two — how it works / the approach taken.</p>
    </section>

    <section class="project-section fade-in">
        <h2>Key features</h2>
        <!-- TODO: list the main features -->
        <ul class="project-features">
            <li>Feature one.</li>
            <li>Feature two.</li>
            <li>Feature three.</li>
        </ul>
    </section>

    <section class="project-section fade-in">
        <h2>Tech stack</h2>
        <!-- TODO: one entry per key technology -->
        <div class="project-stack-grid">
            <div class="project-stack-item">
                <h3>Tech 1</h3>
                <p>Why/how it was used.</p>
            </div>
            <div class="project-stack-item">
                <h3>Tech 2</h3>
                <p>Why/how it was used.</p>
            </div>
        </div>
    </section>

    <section class="project-section fade-in">
        <h2>Gallery</h2>
        <!-- TODO: add screenshots, each thumbnail links to the full-size image -->
        <div class="project-gallery">
            <a href="../static/PLACEHOLDER.png" target="_blank">
                <img src="../static/PLACEHOLDER.png" alt="<!-- TODO: alt text -->">
            </a>
        </div>
    </section>

    <footer>
        <p>© 2025 Giovanni Bocchi, PhD Portfolio.</p>
    </footer>

    <script src="../static/js/shared.js"></script>
</body>

</html>
```

- [ ] **Step 3: Verify the file is well-formed and paths resolve**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('projects/_template.html', encoding='utf-8').read()
assert content.count('<html') == 1 and content.count('</html>') == 1
assert '../static/css/shared.css' in content
assert '../static/js/shared.js' in content
assert content.count('id=\"navbar\"') == 1
print('OK')
"
```
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add projects/_template.html
git commit -m "$(cat <<'EOF'
Add blank project detail page template

Starting point to duplicate for each project's detail page:
hero, overview, features, tech stack, and gallery sections, reusing
the shared nav/footer/variables from static/css/shared.css.
EOF
)"
```

---

### Task 4: Create the worked example (`projects/camera-bricks.html`)

**Files:**
- Create: `projects/camera-bricks.html`

**Interfaces:**
- Consumes: `projects/_template.html` (Task 3) as its starting structure; `static/css/shared.css` / `static/js/shared.js` (Tasks 1–2).
- Produces: the page that Task 5's click-through wiring is verified against — the filename must equal `slugify("Camera Bricks")` = `camera-bricks.html`.

- [ ] **Step 1: Write `projects/camera-bricks.html`**

Create `projects/camera-bricks.html` with this exact content (duplicated from `_template.html`, hero/overview filled with the real card data from `index.html`'s Camera Bricks card, features/tech-stack-notes/gallery left as structurally-complete placeholders per the spec):

```html
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Camera Bricks — Giovanni Bocchi</title>
    <meta name="description"
        content="Camera Bricks trasforma qualsiasi foto in un'immagine stile Brick, con formati, dimensioni ed effetti a tema.">
    <meta name="author" content="Giovanni Bocchi">

    <!-- Open Graph / social -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Camera Bricks — Giovanni Bocchi">
    <meta property="og:description"
        content="Camera Bricks trasforma qualsiasi foto in un'immagine stile Brick, con formati, dimensioni ed effetti a tema.">
    <meta property="og:image" content="../static/camera.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Camera Bricks — Giovanni Bocchi">
    <meta name="twitter:description"
        content="Camera Bricks trasforma qualsiasi foto in un'immagine stile Brick, con formati, dimensioni ed effetti a tema.">
    <meta name="twitter:image" content="../static/camera.png">

    <!-- Favicon (inline SVG) -->
    <link rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230a0e16'/><text x='50' y='70' font-size='58' font-family='monospace' font-weight='700' text-anchor='middle' fill='%2338bdf8'>G</text></svg>">

    <!-- PWA -->
    <link rel="manifest" href="../manifest.webmanifest">
    <meta name="theme-color" content="#0a0e16">
    <link rel="apple-touch-icon" href="../static/icons/apple-touch-icon.png">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="G. Bocchi">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Shared site styles (variables, nav, buttons, footer, animations) -->
    <link rel="stylesheet" href="../static/css/shared.css">
    <style>
        /* Page-specific styles for project detail pages */

        .project-detail-back {
            position: relative;
            z-index: 1;
            display: block;
            max-width: var(--maxw);
            margin: 6.5rem auto 0;
            padding: 0 2.5rem;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .project-detail-back:hover {
            color: var(--brand);
        }

        .project-hero {
            max-width: var(--maxw);
            margin: 2rem auto 0;
            padding: 0 2.5rem 3rem;
            display: grid;
            gap: 2rem;
        }

        .project-hero-image {
            width: 100%;
            max-height: 420px;
            object-fit: cover;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }

        .project-hero h1 {
            font-family: var(--font-display);
            font-size: var(--fs-section);
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .project-tagline {
            color: var(--text-muted);
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .tech-tag {
            background: rgba(56, 189, 248, 0.1);
            color: var(--brand);
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.78rem;
            font-weight: 500;
            border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .project-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .project-section {
            max-width: var(--maxw);
            margin: 0 auto;
            padding: 0 2.5rem 3rem;
        }

        .project-section h2 {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .project-section p {
            color: var(--text-muted);
            margin-bottom: 1rem;
            line-height: 1.7;
        }

        .project-features {
            list-style: none;
            display: grid;
            gap: 0.75rem;
        }

        .project-features li {
            color: var(--text-muted);
            padding-left: 1.5rem;
            position: relative;
            line-height: 1.6;
        }

        .project-features li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.55rem;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--gradient);
        }

        .project-stack-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.25rem;
        }

        .project-stack-item {
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.25rem;
        }

        .project-stack-item h3 {
            font-family: var(--font-display);
            font-size: 1rem;
            color: var(--brand);
            margin-bottom: 0.4rem;
        }

        .project-stack-item p {
            font-size: 0.92rem;
            margin-bottom: 0;
        }

        .project-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
        }

        .project-gallery a {
            display: block;
            border-radius: var(--radius);
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .project-gallery img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }

        .project-gallery a:hover img {
            transform: scale(1.05);
        }

        @media (max-width: 768px) {
            .project-hero {
                padding: 0 1.25rem 2rem;
            }

            .project-section {
                padding: 0 1.25rem 2rem;
            }

            .project-detail-back {
                padding: 0 1.25rem;
            }
        }
    </style>
</head>

<body>
    <div class="bg-animation" id="bgAnimation"></div>

    <nav id="navbar">
        <div class="nav-container">
            <a href="../index.html#home" class="logo">Giovanni Bocchi</a>
            <ul class="nav-links" id="navLinks">
                <li><a href="../index.html#about">About me</a></li>
                <li><a href="../index.html#education">Education</a></li>
                <li><a href="../index.html#experience">Experiences</a></li>
                <li><a href="../index.html#projects">Projects</a></li>
                <li><a href="../index.html#hobbies">Miscellanea</a></li>
                <li><a href="../index.html#contact">Contacts</a></li>
            </ul>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <a href="../index.html#projects" class="project-detail-back fade-in">← Back to projects</a>

    <section class="project-hero fade-in">
        <img src="../static/camera.png" alt="Immagine Camera Bricks" class="project-hero-image">
        <div>
            <h1>Camera Bricks</h1>
            <p class="project-tagline">Transform any generic photo into a vibrant, eye-catching Brick picture.</p>
            <div class="project-tech">
                <span class="tech-tag">Python</span>
                <span class="tech-tag">Streamlit</span>
                <span class="tech-tag">OpenCV</span>
                <span class="tech-tag">Docker</span>
            </div>
            <div class="project-links">
                <a href="https://camerabricks.streamlit.app" class="card-button" target="_blank">Live Demo</a>
            </div>
        </div>
    </section>

    <section class="project-section fade-in">
        <h2>Overview</h2>
        <p>Camera Bricks turns any photo into a vibrant, eye-catching brick-art picture. Users upload an image and
            the app rebuilds it as a mosaic of virtual bricks, mimicking the look of building-block art from a
            physical brick set.</p>
        <p>A few simple controls — brick format, size, and themed color effects — let the same photo be
            reinterpreted in several styles without leaving the browser.</p>
        <p>Under the hood it uses OpenCV for image processing, a Streamlit front end for the interactive controls,
            and ships as a Docker image for easy deployment.</p>
    </section>

    <section class="project-section fade-in">
        <h2>Key features</h2>
        <!-- TODO: list the main features -->
        <ul class="project-features">
            <li>Feature one.</li>
            <li>Feature two.</li>
            <li>Feature three.</li>
        </ul>
    </section>

    <section class="project-section fade-in">
        <h2>Tech stack</h2>
        <!-- TODO: fill in the "why/how used" text for each -->
        <div class="project-stack-grid">
            <div class="project-stack-item">
                <h3>Python</h3>
                <p>Why/how it was used.</p>
            </div>
            <div class="project-stack-item">
                <h3>Streamlit</h3>
                <p>Why/how it was used.</p>
            </div>
            <div class="project-stack-item">
                <h3>OpenCV</h3>
                <p>Why/how it was used.</p>
            </div>
            <div class="project-stack-item">
                <h3>Docker</h3>
                <p>Why/how it was used.</p>
            </div>
        </div>
    </section>

    <section class="project-section fade-in">
        <h2>Gallery</h2>
        <!-- TODO: add more screenshots -->
        <div class="project-gallery">
            <a href="../static/camera.png" target="_blank">
                <img src="../static/camera.png" alt="Camera Bricks screenshot">
            </a>
        </div>
    </section>

    <footer>
        <p>© 2025 Giovanni Bocchi, PhD Portfolio.</p>
    </footer>

    <script src="../static/js/shared.js"></script>
</body>

</html>
```

- [ ] **Step 2: Verify**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('projects/camera-bricks.html', encoding='utf-8').read()
assert '<h1>Camera Bricks</h1>' in content
assert 'camerabricks.streamlit.app' in content
assert '../static/camera.png' in content
print('OK')
"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add projects/camera-bricks.html
git commit -m "$(cat <<'EOF'
Add Camera Bricks project detail page as a worked example

Duplicated from _template.html and filled with the real card data
(title, tagline, tech tags, live demo link, expanded overview).
Verifies the template renders correctly end to end.
EOF
)"
```

---

### Task 5: Wire card click-through to detail pages in `index.html`

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.projects-grid` / `.project-card` / `h3` / `a.card-button` markup (unchanged, already present); `projects/<slug>.html` pages (Tasks 3–4).
- Produces: clicking anywhere on a `.project-card` (except its `a.card-button`) navigates to `projects/<slug>.html`, where `<slug>` is computed by a `slugify()` function added to the existing `DOMContentLoaded` handler.

- [ ] **Step 1: Add `cursor: pointer` to `.project-card`**

In `index.html`, find:
```css
        .project-card {
            background: var(--bg-elev);
            border-radius: var(--radius-lg);
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            max-width: 600px;
        }
```

Replace with:
```css
        .project-card {
            background: var(--bg-elev);
            border-radius: var(--radius-lg);
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            max-width: 600px;
            cursor: pointer;
        }
```

- [ ] **Step 2: Add the slugify + click-delegation logic**

In `index.html`, find (inside the existing `DOMContentLoaded` handler, right after the load-all wiring):
```js
            if (loadAllBtn) {
                loadAllBtn.addEventListener('click', () => {
                    visibleCount = projectCards.length;
                    renderProjects();
                });
            }

            renderProjects();
        });
```

Replace with:
```js
            if (loadAllBtn) {
                loadAllBtn.addEventListener('click', () => {
                    visibleCount = projectCards.length;
                    renderProjects();
                });
            }

            // --- Card click-through to project detail page ---
            function slugify(text) {
                return text
                    .toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

            const projectsGrid = document.querySelector('.projects-grid');
            if (projectsGrid) {
                projectsGrid.addEventListener('click', (e) => {
                    if (e.target.closest('a.card-button')) return;
                    const card = e.target.closest('.project-card');
                    if (!card) return;
                    const title = card.querySelector('h3')?.textContent.trim();
                    if (!title) return;
                    window.location.href = `projects/${slugify(title)}.html`;
                });
            }

            renderProjects();
        });
```

- [ ] **Step 3: Verify the edits landed and are unique**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -c "
content = open('index.html', encoding='utf-8').read()
assert content.count('function slugify(text) {') == 1
assert content.count('cursor: pointer;') >= 1
print('OK')
"
```
Expected: `OK`

- [ ] **Step 4: Functional check in the browser**

With the local server running (`http://localhost:8123`):
1. Click the Camera Bricks card (not its Live Demo button) → confirm the browser navigates to `http://localhost:8123/projects/camera-bricks.html` and the detail page renders correctly.
2. Go back, click directly on the Camera Bricks card's "Live Demo" button → confirm it still opens `https://camerabricks.streamlit.app` in a new tab and does **not** also navigate to the detail page.
3. Click a card for a project that has no detail page yet (e.g. Face Tracking) → confirm the browser attempts to navigate to `projects/face-tracking.html` and gets a 404 (expected, not a regression).
4. Confirm search, filters, and load more/load all still work as before.

- [ ] **Step 5: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add index.html
git commit -m "$(cat <<'EOF'
Make project cards clickable through to their detail page

Delegated click handler on .projects-grid computes a slug from each
card's title and navigates to projects/<slug>.html. Clicks on the
existing card-button link are excluded so external links still work.
EOF
)"
```

---

### Task 6: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- None (documentation only).

- [ ] **Step 1: Update the Architecture section**

In `CLAUDE.md`, find:
```markdown
## Architecture

Everything is self-contained in `index.html`:

- **`<style>` block** — all CSS, using CSS custom properties (`--primary-color`, `--secondary-color`, `--accent-color`, `--card-bg`, `--gradient`, etc.) defined on `:root`. Theme changes go here.
- **HTML body** — sequential sections: `#home`, `#about`, `#education`, `#experience`, `#skills`, `#projects`, `#certifications`, `#hobbies`, `#contact`, then `<footer>`.
- **`<script>` block** at the bottom — all vanilla JavaScript with no external dependencies.
```

Replace with:
```markdown
## Architecture

`index.html` holds the single-page site. `static/css/shared.css` and
`static/js/shared.js` hold CSS/JS shared with the project detail pages
under `projects/`.

- **`static/css/shared.css`** — CSS shared by every page: `:root` custom
  properties (`--brand`, `--bg`, `--gradient`, etc.), reset, the animated
  background, nav, `.card-button`, footer, and `.fade-in` transitions.
  Site-wide theme changes (colors, fonts) go here.
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
```

- [ ] **Step 2: Update the "Adding a project" section**

In `CLAUDE.md`, find:
```markdown
### Adding a project

Copy an existing `.project-card` div inside `.projects-grid`. The filter button for any new `<span class="tech-tag">` is generated automatically — no JS changes needed.
```

Replace with:
```markdown
### Adding a project

Copy an existing `.project-card` div inside `.projects-grid`. The filter button for any new `<span class="tech-tag">` is generated automatically — no JS changes needed.

Clicking a card navigates to `projects/<slug>.html`, where `<slug>` is the
card's `<h3>` title lowercased, with accents stripped and non-alphanumeric
runs turned into single hyphens (e.g. "Camera Bricks" → `camera-bricks.html`).
To give a project a detail page, copy `projects/_template.html` to
`projects/<slug>.html` (the slug must match) and fill in the `<!-- TODO -->`
placeholders. Until that file exists, clicking the card 404s.
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && grep -c "projects/<slug>.html" CLAUDE.md
```
Expected: `2` (one in each updated section).

- [ ] **Step 4: Commit**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Document project detail pages in CLAUDE.md

Covers the new static/css, static/js, and projects/ files and how a
new project gets a detail page.
EOF
)"
```

---

### Task 7: End-to-end verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Serve the site locally**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && python3 -m http.server 8123 >/tmp/portfolio_server.log 2>&1 &
sleep 1
```

- [ ] **Step 2: Walk through the spec's verification checklist in the browser**

1. Open `http://localhost:8123`, confirm the home page renders identically to before this plan (nav, animated background, hero, project cards, footer) — no visual regressions from the CSS/JS extraction.
2. Click the Camera Bricks card → confirm navigation to `projects/camera-bricks.html`, with working nav (including mobile hamburger at a narrow viewport), animated background, "← Back to projects" link (returns to `index.html#projects`), hero, overview, features/tech-stack/gallery sections all rendering with the shared styling.
3. From the detail page, click "← Back to projects" → confirm it lands back on the home page's Projects section.
4. Click a card without a detail page yet → confirm a 404, and confirm the rest of the home page (search, filters, load more/all) is unaffected.
5. Check the browser console on both pages for errors.

- [ ] **Step 3: Confirm working tree is clean**

```bash
cd /Users/gbocchi/GitHub/dev_pers/portfolio && git status
```
Expected: `nothing to commit, working tree clean` (every task already committed its own changes).

- [ ] **Step 4: Stop the local server**

```bash
kill %1 2>/dev/null; pkill -f "http.server 8123" 2>/dev/null; true
```

No commit needed for this task — it's verification only.
