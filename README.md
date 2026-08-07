# Giovanni Bocchi, Ph.D. — Personal Portfolio

Static single-page portfolio for Giovanni Bocchi, Ph.D. — Data Scientist, AI Researcher, and Head of Data Science.

## Running locally

```bash
python -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`. No build step required.

## Project structure

```
Portfolio/
├── index.html                    # single-page site (HTML + page-specific CSS/JS)
├── projects/
│   ├── _template.html            # blank starting point for a new project's detail page
│   └── camera-bricks.html        # one project's detail page (one file per project)
├── static/
│   ├── css/
│   │   ├── shared.css            # variables, nav, buttons, footer, animations — used by every page
│   │   └── project-detail.css    # hero/overview/features/gallery styling — used only by projects/*.html
│   ├── js/
│   │   └── shared.js             # nav toggle, smooth scroll, scroll-shrink, fade-in observer
│   ├── gbocchi3.png              # profile photo
│   ├── CV_Giovanni_Bocchi_EN.pdf
│   └── *.png                     # project card screenshots
└── README.md
```

## Architecture

`index.html` holds the single-page site. `static/css/`, `static/js/`, and
`projects/` hold the files shared with (or making up) the project detail
pages.

- **`static/css/shared.css`** — CSS shared by every page: `:root` custom
  properties (`--brand`, `--bg`, `--gradient`, etc.), reset, the animated
  background, nav, `.card-button`, `.tech-tag`, footer, and `.fade-in`
  transitions.
- **`static/css/project-detail.css`** — CSS used only by `projects/*.html`:
  hero banner, overview/features/tech-stack/gallery sections.
- **`index.html` `<style>` block** — CSS specific to the single-page site:
  hero, timeline, skills, projects grid/filters, contact, etc.
- **`index.html` body** — sequential sections: `#home`, `#about`,
  `#education`, `#experience`, `#skills`, `#projects`, `#certifications`,
  `#hobbies`, `#contact`, `<footer>`.
- **`static/js/shared.js`** — nav toggle, smooth scroll, scroll-shrink, and
  the `.fade-in` `IntersectionObserver`, shared by every page.
- **`index.html` `<script>` block** — page-specific vanilla JS: service
  worker registration, project search/filter/pagination, and the
  project-card → detail-page click-through.
- **`projects/<slug>.html`** — one static detail page per project, linked
  from its home-page card. `projects/_template.html` is the starting point
  for a new one.

### Key JS behaviors

- **Animated background**: pure CSS (`.bg-animation` in `shared.css`) — a
  gradient + grain overlay, no JS involved.
- **Scroll animations**: `IntersectionObserver` (in `shared.js`) adds
  `.visible` to `.fade-in` elements when they enter the viewport.
- **Project filter**: scans all `.tech-tag` elements on `DOMContentLoaded`,
  renders filter buttons dynamically. Adding a card with a new tag
  automatically adds the button — no JS changes needed.
- **Project card click-through**: clicking a card (except its Live
  Demo/GitHub link) navigates to `projects/<slug>.html`, where `<slug>` is
  the card's title lowercased, with accents stripped and non-alphanumeric
  runs turned into hyphens.

## Site sections

| Section | Content |
|---|---|
| Home | Hero with name and title |
| About | Skills overview (Programming, ML, NLP, DevOps, BI, …) |
| Education | PhD in Nuclear Physics, MSc, BSc — alternating timeline |
| Experience | Head of DS, Data Scientist, Minitab Trainer, Assistant Professor |
| Skills | Statistical & Data Science methods |
| Projects | Personal projects (CV, Flutter apps, Streamlit tools), filterable by tech tag |
| Certifications | MongoDB, TIBCO Spotfire, Deep Learning Specialization, Minitab |
| Hobbies | Digital painting, clown doctor volunteering, Go & chess |
| Contact | Links and contact info |

## Adding a project

Copy an existing `.project-card` block inside `.projects-grid`. Any new `<span class="tech-tag">` is picked up by the filter system automatically.

To give the project a detail page, copy `projects/_template.html` to
`projects/<slug>.html` — the slug must be the card's title lowercased, with
accents stripped and non-alphanumeric runs turned into hyphens (e.g.
"Camera Bricks" → `camera-bricks.html`) — and fill in the `<!-- TODO -->`
placeholders. Until that file exists, clicking the card 404s.

## Adding a timeline entry

Add a `.timeline-item` with alternating `.timeline-left` / `.timeline-right` inside the relevant `.timeline` container.

## Skills & technologies

**Programming**: Python, R, Fortran, C++, Matlab, Mathematica  
**ML / AI**: scikit-learn, PyTorch, TensorFlow, Keras, OpenCV, Mediapipe  
**Data viz**: Plotly, Matplotlib, Seaborn, Altair, ggplot2  
**Databases**: SQL, PostgreSQL, MongoDB, Chroma, Qdrant  
**LLM / NLP**: OpenAI, Anthropic, LangChain, Ollama, HuggingFace, NLTK  
**Mobile**: Dart, Flutter  
**DevOps**: Git, Docker, Jenkins, Heroku  
**Web**: HTML, CSS, Streamlit, Dash, R Shiny  
**BI**: Spotfire, Power BI, QlikSense, Minitab  

## Contact

- Email: giovanni.bocchi@gmail.com
- LinkedIn: [linkedin.com/in/giovannibocchi](https://linkedin.com/in/giovannibocchi)
- GitHub: [github.com/giova86](https://github.com/giova86)
