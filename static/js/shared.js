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
