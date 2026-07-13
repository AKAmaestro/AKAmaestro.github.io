/* AKAMAESTRO core runtime: theme, cursor, lightbox, reveal, nav, protection. */
(function () {
    'use strict';

    /* ---------- THEME ---------- */
    const saved = localStorage.getItem('aka-theme');
    if (saved === 'light') document.body.classList.add('light-mode');

    window.toggleTheme = function () {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('aka-theme',
            document.body.classList.contains('light-mode') ? 'light' : 'dark');
        syncThemeBtn();
        document.dispatchEvent(new CustomEvent('aka-theme-change'));
    };

    function syncThemeBtn() {
        document.querySelectorAll('.theme-btn').forEach(b => {
            b.textContent = document.body.classList.contains('light-mode') ? '☀ LIGHT' : '🌙 DARK';
        });
    }

    /* ---------- CUSTOM CURSOR ---------- */
    function initCursor() {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const c = document.createElement('div');
        c.className = 'custom-cursor';
        document.body.appendChild(c);
        document.addEventListener('mousemove', e => {
            c.style.left = e.clientX + 'px';
            c.style.top = e.clientY + 'px';
        });
        document.addEventListener('mouseover', e => {
            document.body.classList.toggle('hover-active',
                !!e.target.closest('a, button, .zoomable, [onclick]'));
        });
    }

    /* ---------- LIGHTBOX ---------- */
    let lbImages = [], lbIndex = 0;

    function initLightbox() {
        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.innerHTML = '<button class="close-lb">CLOSE [ESC]</button><img alt=""><div class="caption"></div>';
        document.body.appendChild(lb);
        lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
        lb.querySelector('.close-lb').addEventListener('click', closeLB);

        lbImages = Array.from(document.querySelectorAll('.zoomable'));
        lbImages.forEach((el, i) => el.addEventListener('click', () => openLB(i)));
    }

    function openLB(i) {
        lbIndex = i;
        const el = lbImages[i];
        const lb = document.getElementById('lightbox');
        lb.querySelector('img').src = el.dataset.full || el.currentSrc || el.src;
        lb.querySelector('.caption').textContent = el.alt || '';
        lb.classList.add('active');
    }

    function closeLB() {
        const lb = document.getElementById('lightbox');
        if (lb) lb.classList.remove('active');
    }

    function lbActive() {
        const lb = document.getElementById('lightbox');
        return lb && lb.classList.contains('active');
    }

    /* ---------- REVEAL ON SCROLL ---------- */
    function initReveal() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
        }, { threshold: 0.08 });
        document.querySelectorAll('.rv').forEach(el => obs.observe(el));
    }

    /* ---------- TO TOP ---------- */
    function initToTop() {
        const b = document.createElement('button');
        b.id = 'to-top';
        b.textContent = '↑ TOP';
        b.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(b);
        addEventListener('scroll', () => b.classList.toggle('show', scrollY > 500), { passive: true });
    }

    /* ---------- ESC = up one level (old modal-close muscle memory) ---------- */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (lbActive()) { closeLB(); return; }
            const up = document.body.dataset.up;
            if (up) location.href = up;
        }
        if (lbActive() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            lbIndex = (lbIndex + (e.key === 'ArrowRight' ? 1 : -1) + lbImages.length) % lbImages.length;
            openLB(lbIndex);
        }
    });

    /* ---------- PROTECTION (standard deterrents) ---------- */
    function initProtection() {
        document.addEventListener('contextmenu', e => {
            if (e.target.closest('img, video, .protected')) e.preventDefault();
        });
        document.addEventListener('dragstart', e => {
            if (e.target.closest('img, video')) e.preventDefault();
        });
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') e.preventDefault();
        });
        document.querySelectorAll('img, video').forEach(m => m.setAttribute('draggable', 'false'));
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncThemeBtn();
        initCursor();
        initLightbox();
        initReveal();
        initToTop();
        initProtection();
    });
})();
