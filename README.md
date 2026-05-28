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
├── index.html                    # entire site (HTML + CSS + JS)
├── static/
│   ├── gbocchi3.png              # profile photo
│   ├── CV_Giovanni_Bocchi_EN.pdf
│   └── *.png                     # project card screenshots
└── README.md
```

## Architecture

Everything lives in `index.html`:

- **`<style>` block** — all CSS, with design tokens defined as CSS custom properties on `:root` (`--primary-color`, `--secondary-color`, `--accent-color`, `--card-bg`, `--gradient`, …).
- **HTML body** — sequential sections: `#home`, `#about`, `#education`, `#experience`, `#skills`, `#projects`, `#certifications`, `#hobbies`, `#contact`, `<footer>`.
- **`<script>` block** — vanilla JS, no external dependencies.

### Key JS behaviors

- **Particle background**: `createParticles()` generates 50 animated `<div class="particle">` elements into `#bgAnimation` on load.
- **Scroll animations**: `IntersectionObserver` adds `.visible` to `.fade-in` elements when they enter the viewport.
- **Project filter**: scans all `.tech-tag` elements on `DOMContentLoaded`, renders filter buttons dynamically. Adding a card with a new tag automatically adds the button — no JS changes needed.

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
