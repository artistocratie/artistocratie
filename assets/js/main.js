/* ============================================================
   Artistocratie — JS partagé (multi-pages, null-safe)
   Chaque bloc ne s'exécute que si ses éléments existent.
   ============================================================ */

/* ---- Google Analytics : actions importantes, sans données personnelles ---- */
function trackAnalyticsEvent(name, parameters) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, Object.assign({ page_path: window.location.pathname }, parameters));
}

(function () {
  const cleanLabel = value => (value || '').replace(/\s+/g, ' ').trim().slice(0, 100);

  document.addEventListener('click', event => {
    const element = event.target.closest('a, button');
    if (!element) return;

    const href = element.getAttribute('href') || '';
    const label = cleanLabel(element.getAttribute('aria-label') || element.textContent);
    const destination = href || element.id || '';

    if (href.startsWith('mailto:')) {
      trackAnalyticsEvent('contact_click', { contact_method: 'email', button_label: label });
    } else if (/instagram\.com/i.test(href)) {
      trackAnalyticsEvent('instagram_click', { button_label: label });
    } else if (/tiktok\.com/i.test(href)) {
      trackAnalyticsEvent('tiktok_click', { button_label: label });
    } else {
      trackAnalyticsEvent('site_click', {
        element_type: element.tagName.toLowerCase(),
        button_label: label,
        destination: destination.slice(0, 200)
      });
    }
  });
})();

/* ---- Curseur custom (desktop) ---- */
(function () {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.25; ry += (my - ry) * 0.25;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ---- Fond de nav au scroll ---- */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll); onScroll();
})();

/* ---- Apparition au scroll ---- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible')); return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ---- Accueil : travelling le long du mur d’exposition ---- */
(function () {
  const section = document.querySelector('.scroll-gallery');
  const track = document.querySelector('.gallery-track');
  if (!section || !track) return;

  let ticking = false;
  const update = () => {
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.13);
    track.style.setProperty('--gallery-shift', `${-progress * maxShift}px`);
    section.style.setProperty('--gallery-progress', `${progress * 100}%`);
    ticking = false;
  };
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
})();

/* ---- Lightbox (pages collections) ---- */
function openLightbox(title, tag, medium, format, year, desc, imgSrc) {
  trackAnalyticsEvent('view_artwork', { artwork_title: title, artwork_series: tag });
  const lb = document.getElementById('lightbox'); if (!lb) return;
  const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
  set('lightbox-title', title); set('lightbox-tag', tag); set('lightbox-medium', medium);
  set('lightbox-format', format); set('lightbox-year', year); set('lightbox-desc', desc);
  const img = document.getElementById('lightbox-img');
  const ph = document.getElementById('lightbox-placeholder');
  if (imgSrc) { if (img) { img.src = imgSrc; img.style.display = 'block'; } if (ph) ph.style.display = 'none'; }
  else { if (img) img.style.display = 'none'; if (ph) ph.style.display = 'flex'; }
  lb.classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => lb.classList.add('visible'), 10);
}
function closeLightbox() {
  const lb = document.getElementById('lightbox'); if (!lb) return;
  lb.classList.remove('visible'); document.body.style.overflow = '';
  setTimeout(() => lb.classList.remove('open'), 400);
}
(function () {
  const lb = document.getElementById('lightbox'); if (!lb) return;
  lb.addEventListener('click', function (e) { if (e.target === this) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

/* ---- Overlay contact / collab ---- */
function openContact() {
  trackAnalyticsEvent('open_contact', {});
  const o = document.getElementById('contactOverlay'); if (!o) return;
  o.classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => o.classList.add('visible'), 10);
}
function closeContact() {
  const o = document.getElementById('contactOverlay'); if (!o) return;
  o.classList.remove('visible'); document.body.style.overflow = '';
  setTimeout(() => o.classList.remove('open'), 400);
}
(function () {
  const o = document.getElementById('contactOverlay'); if (!o) return;
  o.addEventListener('click', function (e) { if (e.target === this) closeContact(); });
})();

/* ---- Formulaire de collaboration : intention d'envoi ---- */
(function () {
  const form = document.querySelector('.collab-form'); if (!form) return;
  form.addEventListener('submit', () => trackAnalyticsEvent('contact_form_submit', { form_name: 'collaboration' }));
})();
