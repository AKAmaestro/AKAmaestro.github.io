/* AKAMAESTRO core runtime: theme, cursor, lightbox, reveal, nav, protection. */
(function () {
    'use strict';

    /* the 9 case studies, in the same order as the Home works grid —
       single source of truth reused by the nav Work dropdown so every
       page is 2 actions from any project (hover/tap Work, then click) */
    const WORKS = [
        { title: 'Amnesea', tag: 'Entrepreneurship', href: 'work/amnesea.html' },
        { title: 'KeyBound', tag: 'Gaming', href: 'work/keybound.html' },
        { title: 'Mocking Bot', tag: 'Robotics', href: 'work/mocking-bot.html' },
        { title: 'Retina AI', tag: 'Med-Tech', href: 'work/retina-ai.html' },
        { title: 'TimeBound', tag: 'Gaming', href: 'work/timebound.html' },
        { title: 'Balance Bot', tag: 'Applied Sciences', href: 'work/balance-bot.html' },
        { title: 'AR NFT', tag: 'Blockchain / Crypto', href: 'work/ar-nft.html' },
        { title: 'Facially', tag: 'Web3 / CV', href: 'work/facially.html' },
        { title: 'Arts', tag: 'Visuals & Sculptures', href: 'work/arts.html' },
    ];

    /* ---------- THEME (saved choice wins; else follow the OS) ---------- */
    const saved = localStorage.getItem('aka-theme');
    if (saved === 'light') document.body.classList.add('light-mode');
    else if (!saved && !document.body.classList.contains('light-mode')
        && matchMedia('(prefers-color-scheme: light)').matches) {
        document.body.classList.add('light-mode');
    }

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
        document.querySelectorAll('.rv, .rv-stagger').forEach(el => obs.observe(el));
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

    /* ---------- POPUP ENGINE (info briefs, booking, vault) ---------- */
    let popEl = null;

    function ensurePop() {
        if (popEl) return popEl;
        popEl = document.createElement('div');
        popEl.className = 'pop-overlay';
        popEl.innerHTML = '<div class="pop-card"><button class="pop-close" aria-label="Close">✕</button><h3></h3><div class="pop-body"></div></div>';
        document.body.appendChild(popEl);
        popEl.addEventListener('click', e => { if (e.target === popEl) closePop(); });
        popEl.querySelector('.pop-close').addEventListener('click', closePop);
        return popEl;
    }

    window.openPop = function (title, bodyHTML) {
        const p = ensurePop();
        p.querySelector('h3').textContent = title;
        p.querySelector('.pop-body').innerHTML = bodyHTML;
        p.classList.add('active');
        const first = p.querySelector('input, a, button:not(.pop-close)');
        if (first) first.focus();
    };

    window.closePop = function () { if (popEl) popEl.classList.remove('active'); };
    function popActive() { return popEl && popEl.classList.contains('active'); }

    function initPopTriggers() {
        document.addEventListener('click', e => {
            const t = e.target.closest('[data-pop]');
            if (!t) return;
            if (e.target.closest('a[href]')) return; // real links inside cards still work
            let body = t.dataset.popBody || '';
            if (t.dataset.popSrc) {
                const tpl = document.querySelector(t.dataset.popSrc);
                if (tpl) body = tpl.innerHTML;
            }
            openPop(t.dataset.popTitle || t.dataset.pop || 'INFO', body);
        });
    }

    /* ---------- MOBILE NAV (burger + dropdown sheet) ---------- */
    function initMobileNav() {
        const nav = document.querySelector('.site-nav');
        const links = nav && nav.querySelector('.nav-links');
        if (!nav || !links) return;
        const btn = document.createElement('button');
        btn.className = 'nav-burger';
        btn.setAttribute('aria-label', 'Menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span></span><span></span><span></span>';
        btn.addEventListener('click', () => {
            closeWorkDropdown();
            const open = document.body.classList.toggle('nav-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.insertBefore(btn, nav.querySelector('.theme-btn'));
        // close the sheet when a link is tapped — EXCEPT the Work trigger, whose
        // first tap opens its in-sheet accordion (closing the sheet would undo it)
        links.addEventListener('click', e => {
            const a = e.target.closest('a');
            if (a && !a.classList.contains('nav-work-trigger')) closeMobileNav();
        });
        document.addEventListener('click', e => {
            if (document.body.classList.contains('nav-open') && !e.target.closest('.site-nav')) closeMobileNav();
        });
    }
    function closeMobileNav() {
        document.body.classList.remove('nav-open');
        const b = document.querySelector('.nav-burger');
        if (b) b.setAttribute('aria-expanded', 'false');
    }
    function mobileNavOpen() { return document.body.classList.contains('nav-open'); }

    /* ---------- WORK DROPDOWN (hover on desktop, tap on touch/keyboard) ----------
       Reaching any of the 9 case studies used to mean: land on Home, scroll to
       the grid, click. This makes it 1 hover/tap + 1 click, from every page. */
    function initWorkDropdown() {
        const nav = document.querySelector('.site-nav');
        const links = nav && nav.querySelector('.nav-links');
        if (!nav || !links) return;
        const trigger = Array.from(links.querySelectorAll('a')).find(a => /index\.html#works$/.test(a.getAttribute('href') || ''));
        if (!trigger) return;

        const root = location.pathname.includes('/work/') ? '../' : '';
        const wrap = document.createElement('div');
        wrap.className = 'nav-work';
        trigger.parentNode.insertBefore(wrap, trigger);
        wrap.appendChild(trigger);
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.classList.add('nav-work-trigger');

        const panel = document.createElement('div');
        panel.className = 'work-dropdown';
        panel.innerHTML = WORKS.map(w =>
            `<a href="${root}${w.href}"><span class="wd-title">${w.title}</span><span class="wd-tag">${w.tag}</span></a>`
        ).join('') + `<a class="wd-all" href="${root}index.html#works">See all work →</a>`;
        wrap.appendChild(panel);

        const isMobileNav = () => matchMedia('(max-width: 1200px)').matches;

        // the panel is position:fixed (to escape the nav's overflow clip), so
        // its coordinates have to be set from the trigger's live rect. On the
        // mobile sheet it's a static accordion instead, so clear any inline
        // coords there or they'd override the stylesheet.
        const position = () => {
            if (isMobileNav()) { panel.style.top = panel.style.left = ''; return; }
            const r = trigger.getBoundingClientRect();
            const pw = panel.offsetWidth || 260;
            panel.style.top = (r.bottom + 10) + 'px';
            // clamp so the panel never runs off the right edge of the viewport
            panel.style.left = Math.max(8, Math.min(r.left, innerWidth - pw - 10)) + 'px';
        };
        const setOpen = open => {
            if (open) position();
            wrap.classList.toggle('open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        // FIRST tap/click opens the panel instead of navigating; once it's open
        // (desktop already opened it on hover, or this is a second tap) the link
        // works normally. Device-agnostic on purpose — do NOT gate on
        // (hover:none): hybrid touch laptops and some in-app webviews report
        // (hover:hover) yet have no real hover, which is exactly why tapping
        // Work used to jump straight to the homepage.
        trigger.addEventListener('click', e => {
            if (!wrap.classList.contains('open')) { e.preventDefault(); setOpen(true); }
        });
        document.addEventListener('click', e => {
            if (wrap.classList.contains('open') && !e.target.closest('.nav-work') && !e.target.closest('.work-dropdown')) setOpen(false);
        });
        panel.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
        // desktop hover still needs aria-expanded kept honest for assistive tech
        wrap.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches && !isMobileNav()) setOpen(true); });
        wrap.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches && !isMobileNav()) setOpen(false); });
        wrap.addEventListener('focusin', () => setOpen(true));
        wrap.addEventListener('focusout', e => { if (!wrap.contains(e.relatedTarget) && !panel.contains(e.relatedTarget)) setOpen(false); });
        // keep the fixed panel aligned to its (sticky) trigger
        addEventListener('resize', () => { if (wrap.classList.contains('open')) position(); });
        addEventListener('scroll', () => { if (wrap.classList.contains('open') && !isMobileNav()) position(); }, { passive: true });
    }
    function closeWorkDropdown() {
        const w = document.querySelector('.nav-work.open');
        if (w) { w.classList.remove('open'); const t = w.querySelector('.nav-work-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }
    }
    function workDropdownOpen() { return !!document.querySelector('.nav-work.open'); }

    /* ---------- NAVIGATION LOADING BAR ----------
       The old page stays on screen while the next one loads, so without any
       indicator a slow next page (spotty in-app browser) reads as "frozen".
       This shows a top progress bar the instant an internal link is tapped;
       it creeps toward the end and is simply replaced when the new document
       paints. It can never get stuck because it lives on the outgoing page. */
    function initNavProgress() {
        const bar = document.createElement('div');
        bar.id = 'nav-loading';
        document.body.appendChild(bar);
        let active = false;
        const start = () => {
            if (active) return; active = true;
            bar.style.transition = 'none'; bar.style.width = '0'; bar.style.opacity = '1';
            void bar.offsetWidth;                       // commit the reset before animating
            bar.style.transition = 'width 8s cubic-bezier(.15,.85,.5,1)';
            bar.style.width = '90%';
        };
        const reset = () => { active = false; bar.style.transition = 'none'; bar.style.width = '0'; bar.style.opacity = '0'; };
        document.addEventListener('click', e => {
            const a = e.target.closest('a[href]');
            if (!a || a.target === '_blank' || a.hasAttribute('download') || e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;   // open-in-new-tab
            let url; try { url = new URL(a.href, location.href); } catch (_) { return; }
            if (url.origin !== location.origin) return;                           // external
            if (url.pathname === location.pathname && url.hash) return;           // same-page anchor
            const proto = (a.getAttribute('href') || '');
            if (proto.startsWith('mailto:') || proto.startsWith('tel:')) return;
            start();
        }, true);
        // restored from back/forward cache — clear any leftover bar
        addEventListener('pageshow', reset);
    }

    /* ---------- LAZY VIDEO: fetch/decode only near the viewport ---------- */
    function initLazyVideo() {
        const vids = document.querySelectorAll('video[data-lazy]');
        if (!vids.length) return;
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                const v = en.target;
                if (en.isIntersecting) v.play().catch(() => { });
                else v.pause();
            });
        }, { rootMargin: '220px 0px' });
        vids.forEach(v => io.observe(v));
    }

    /* ---------- ESC = close popup > lightbox > nav sheet > up one level ---------- */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (popActive()) { closePop(); return; }
            if (lbActive()) { closeLB(); return; }
            if (workDropdownOpen()) { closeWorkDropdown(); return; }
            if (mobileNavOpen()) { closeMobileNav(); return; }
            const up = document.body.dataset.up;
            if (up) location.href = up;
        }
        if (lbActive() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            lbIndex = (lbIndex + (e.key === 'ArrowRight' ? 1 : -1) + lbImages.length) % lbImages.length;
            openLB(lbIndex);
        }
    });

    /* ---------- SITE-WIDE VAULT ACCESS ---------- */
    const VAULT_ROOT = location.pathname.includes('/work/') ? '../' : '';
    const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

    async function vaultDerive(pw, salt, iterations) {
        const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
            base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    }

    window.vaultTryUnlock = async function (pw) {
        const res = await fetch(VAULT_ROOT + 'assets/vault-data.json');
        if (!res.ok) throw new Error('vault data unreachable');
        const data = await res.json();
        const opened = [];
        for (const sec of data.sections) {
            for (const w of sec.wraps) {
                try {
                    const kek = await vaultDerive(pw, b64d(w.salt), data.kdf.iterations);
                    const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(w.iv) }, kek, b64d(w.wk));
                    const ck = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
                    const html = new TextDecoder().decode(
                        await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(sec.iv) }, ck, b64d(sec.ct)));
                    opened.push({ id: sec.id, title: sec.title, html });
                    break;
                } catch (_) { /* this wrap doesn't match — try next */ }
            }
        }
        return opened;
    };

    function vaultGranted() { return !!sessionStorage.getItem('aka-vault-key'); }

    window.vaultPopBody = function () {
        const note = vaultGranted()
            ? '<p><strong style="color:var(--accent);">● ACCESS ACTIVE</strong> — your key is loaded for this session.</p><div class="pop-actions"><a href="' + VAULT_ROOT + 'vault.html"><span class="big">🗝</span> Open the vault dossiers</a></div><p style="margin-top:12px;"><a href="#" onclick="sessionStorage.removeItem(\'aka-vault-key\');location.reload();return false;">Lock again ↺</a></p>'
            : '<p>Some content on this site is <strong>AES-256 encrypted</strong>. If you\'ve been given an access key, enter it here — it unlocks that level of data across every page for this session.</p>' +
            '<div class="vault-pop-input"><input type="password" id="vt-pw" placeholder="ACCESS KEY"><button onclick="vaultSubmit()">UNLOCK</button></div>' +
            '<div class="vault-pop-msg" id="vt-msg"></div>';
        openPop('RESTRICTED ACCESS', note);
        const inp = document.getElementById('vt-pw');
        if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); vaultSubmit(); } });
    };

    window.vaultSubmit = async function () {
        const msg = document.getElementById('vt-msg');
        const pw = document.getElementById('vt-pw').value;
        msg.className = 'vault-pop-msg';
        msg.textContent = 'DERIVING KEY…';
        try {
            const opened = await vaultTryUnlock(pw);
            if (!opened.length) { msg.className = 'vault-pop-msg err'; msg.textContent = '✗ ACCESS DENIED'; return; }
            sessionStorage.setItem('aka-vault-key', pw);
            const tab = document.getElementById('vault-tab');
            if (tab) { tab.classList.add('granted'); tab.textContent = '● ACCESS GRANTED'; }
            msg.className = 'vault-pop-msg ok';
            if (document.querySelector('.gate-zone')) {
                document.body.classList.add('vault-open');
                msg.textContent = '✓ ACCESS GRANTED — this page is now unlocked';
                setTimeout(closePop, 900);
            } else {
                msg.textContent = `✓ ${opened.length} DOSSIER(S) UNLOCKED — opening vault…`;
                setTimeout(() => { location.href = VAULT_ROOT + 'vault.html'; }, 700);
            }
        } catch (err) {
            msg.className = 'vault-pop-msg err';
            msg.textContent = '✗ ' + (location.protocol === 'file:'
                ? 'Serve over http(s) to unlock (file:// blocks vault data)' : err.message);
        }
    };

    function initVaultTab() {
        if (vaultGranted()) document.body.classList.add('vault-open');
        if (document.getElementById('unlock-form')) return; // vault page has its own gate
        const tab = document.createElement('button');
        tab.id = 'vault-tab';
        tab.textContent = vaultGranted() ? '● ACCESS GRANTED' : '⚿ ACCESS';
        if (vaultGranted()) tab.classList.add('granted');
        tab.addEventListener('click', vaultPopBody);
        document.body.appendChild(tab);
    }

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

    /* ---------- MODERN LAYER ---------- */
    function initScrollProgress() {
        const bar = document.createElement('div');
        bar.id = 'scroll-progress';
        (document.querySelector('.site-nav') || document.body).appendChild(bar);
        const update = () => {
            const max = document.documentElement.scrollHeight - innerHeight;
            bar.style.width = max > 0 ? (scrollY / max * 100) + '%' : '0';
        };
        addEventListener('scroll', update, { passive: true });
        update();
    }

    function initGlowCards() {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const cards = document.querySelectorAll(
            '.work-item, .ex-tile, .info-card, .fact-card, .press-card, .mention-card, .cab, .next-project');
        cards.forEach(c => {
            c.classList.add('glow-card');
            c.addEventListener('pointermove', e => {
                const r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                c.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    function initMagneticButtons() {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.querySelectorAll('.btn, .theme-btn').forEach(b => {
            b.addEventListener('pointermove', e => {
                const r = b.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) / r.width;
                const y = (e.clientY - r.top - r.height / 2) / r.height;
                b.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
            });
            b.addEventListener('pointerleave', () => { b.style.transform = ''; });
        });
    }

    /* ---------- HORIZONTAL STRIPS: arrow indicators ---------- */
    function initHScroll() {
        document.querySelectorAll('.hscroll').forEach(strip => {
            const wrap = document.createElement('div');
            wrap.className = 'hscroll-wrap';
            strip.parentNode.insertBefore(wrap, strip);
            wrap.appendChild(strip);
            const mk = dir => {
                const b = document.createElement('button');
                b.className = 'hs-arrow ' + (dir < 0 ? 'left' : 'right');
                b.innerHTML = dir < 0 ? '←' : '→';
                b.setAttribute('aria-label', dir < 0 ? 'Scroll left' : 'Scroll right');
                b.addEventListener('click', () =>
                    strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: 'smooth' }));
                wrap.appendChild(b);
                return b;
            };
            const L = mk(-1), R = mk(1);
            const sync = () => {
                L.toggleAttribute('disabled', strip.scrollLeft < 10);
                R.toggleAttribute('disabled', strip.scrollLeft > strip.scrollWidth - strip.clientWidth - 10);
            };
            strip.addEventListener('scroll', sync, { passive: true });
            addEventListener('resize', sync);
            sync();
        });
    }

    function initLocalTime() {
        const els = document.querySelectorAll('[data-local-time]');
        if (!els.length) return;
        const tick = () => {
            const t = new Date().toLocaleTimeString('en-IN',
                { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
            els.forEach(el => { el.textContent = `IST ${t}`; });
        };
        tick();
        setInterval(tick, 30_000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncThemeBtn();
        initCursor();
        initMobileNav();
        initWorkDropdown();
        initNavProgress();
        initLazyVideo();
        initLightbox();
        initReveal();
        initToTop();
        initProtection();
        initScrollProgress();
        initGlowCards();
        initMagneticButtons();
        initLocalTime();
        initPopTriggers();
        initVaultTab();
        initHScroll();
    });
})();
