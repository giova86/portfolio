// Auto-populates .project-gallery[data-gallery] from window.__galleryImages,
// populated by the <script src="../static/gallery/<slug>/images.js"> tag
// each project page includes. A plain <script> (not fetch) is used so this
// also works when the page is opened directly as a file:// URL.
// Clicking a thumbnail opens a lightbox carousel instead of navigating away.
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = createLightbox();

    document.querySelectorAll('.project-gallery[data-gallery]').forEach((gallery) => {
        const slug = gallery.dataset.gallery;
        const alt = gallery.dataset.galleryAlt || document.title;
        const section = gallery.closest('.project-section');
        const files = (window.__galleryImages || {})[slug] || [];

        if (!files.length) {
            if (section) section.style.display = 'none';
            return;
        }

        const urls = files.map((file) => `../static/gallery/${slug}/${file}`);

        urls.forEach((url, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'project-gallery-item';
            button.setAttribute('aria-label', `${alt} — image ${index + 1} of ${urls.length}`);

            const img = document.createElement('img');
            img.src = url;
            img.alt = alt;
            img.loading = 'lazy';

            button.appendChild(img);
            button.addEventListener('click', () => lightbox.open(urls, index, alt));
            gallery.appendChild(button);
        });
    });
});

function createLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-lightbox';
    overlay.innerHTML = `
        <button type="button" class="gallery-lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" aria-label="Previous image">&#8249;</button>
        <img class="gallery-lightbox-image" alt="">
        <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" aria-label="Next image">&#8250;</button>
        <div class="gallery-lightbox-counter"></div>
    `;
    document.body.appendChild(overlay);

    const imageEl = overlay.querySelector('.gallery-lightbox-image');
    const counterEl = overlay.querySelector('.gallery-lightbox-counter');
    const closeBtn = overlay.querySelector('.gallery-lightbox-close');
    const prevBtn = overlay.querySelector('.gallery-lightbox-prev');
    const nextBtn = overlay.querySelector('.gallery-lightbox-next');

    let urls = [];
    let alt = '';
    let current = 0;

    function render() {
        imageEl.src = urls[current];
        imageEl.alt = alt;
        counterEl.textContent = `${current + 1} / ${urls.length}`;
        const multi = urls.length > 1;
        prevBtn.style.display = multi ? '' : 'none';
        nextBtn.style.display = multi ? '' : 'none';
        counterEl.style.display = multi ? '' : 'none';
    }

    function open(newUrls, startIndex, newAlt) {
        urls = newUrls;
        alt = newAlt;
        current = startIndex;
        render();
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function prev() {
        current = (current - 1 + urls.length) % urls.length;
        render();
    }

    function next() {
        current = (current + 1) % urls.length;
        render();
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });

    return { open };
}
