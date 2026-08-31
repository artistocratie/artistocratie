/* ============================================================
   Artistocratie — JS partagé (multi-pages, null-safe)
   Chaque bloc ne s'exécute que si ses éléments existent.
   ============================================================ */

/* ---- Google Analytics : actions importantes, sans données personnelles ---- */
function analyticsPageName() {
  return window.location.pathname.split('/').pop() || 'index.html';
}
function analyticsViewport() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  if (width < 700) return 'mobile';
  if (width < 1100) return 'tablet';
  return 'desktop';
}
function analyticsText(value, limit = 100) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}
function trackAnalyticsEvent(name, parameters) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, Object.assign({
    page_path: window.location.pathname,
    page_name: analyticsPageName(),
    site_language: document.documentElement.lang || 'fr',
    viewport_category: analyticsViewport()
  }, parameters));
}

(function () {
  const cleanLabel = value => analyticsText(value);
  const interactionArea = element => {
    if (element.closest('#navbar')) return 'navigation';
    if (element.closest('footer')) return 'footer';
    if (element.closest('.hero-actions')) return 'homepage_intro';
    if (element.closest('.wallpaper-viewer')) return 'wallpaper_viewer';
    if (element.closest('.wallpaper-gallery')) return 'wallpaper_gallery';
    if (element.closest('.lightbox')) return 'artwork_viewer';
    if (element.closest('main, section')) return 'main_content';
    return 'other';
  };

  document.addEventListener('click', event => {
    const element = event.target.closest('a, button');
    if (!element) return;

    const href = element.getAttribute('href') || '';
    const label = cleanLabel(element.getAttribute('aria-label') || element.textContent);
    const destination = href || element.id || '';
    const linkType = element.hasAttribute('download') ? 'download' : href.startsWith('mailto:') ? 'email' : /^https?:/i.test(href) ? 'external' : href ? 'internal' : 'button';

    if (href.startsWith('mailto:')) {
      trackAnalyticsEvent('contact_click', { contact_method: 'email', button_label: label, interaction_area: interactionArea(element) });
    } else if (/instagram\.com/i.test(href)) {
      trackAnalyticsEvent('instagram_click', { button_label: label, interaction_area: interactionArea(element) });
    } else if (/tiktok\.com/i.test(href)) {
      trackAnalyticsEvent('tiktok_click', { button_label: label, interaction_area: interactionArea(element) });
    } else {
      trackAnalyticsEvent('site_click', {
        element_type: element.tagName.toLowerCase(),
        button_label: label,
        destination: destination.slice(0, 200),
        link_type: linkType,
        interaction_area: interactionArea(element)
      });
    }
  });
})();

/* ---- Profondeur de lecture (sans suivre l'identité des personnes) ---- */
(function () {
  const reached = new Set();
  const levels = [25, 50, 75, 90];
  let ticking = false;
  const update = () => {
    const root = document.documentElement;
    const travel = Math.max(0, root.scrollHeight - window.innerHeight);
    const progress = travel ? (window.scrollY / travel) * 100 : 0;
    levels.forEach(level => {
      if (progress >= level && !reached.has(level)) {
        reached.add(level);
        trackAnalyticsEvent('scroll_depth', { percent_scrolled: String(level) });
      }
    });
    ticking = false;
  };
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
})();

/* ---- Parcours des formulaires, sans jamais transmettre leur contenu ---- */
(function () {
  const started = new WeakSet();
  const formName = form => analyticsText(form.dataset.analyticsName || form.id || form.className || 'form', 60);
  document.addEventListener('focusin', event => {
    const form = event.target.closest('form');
    if (!form || started.has(form)) return;
    started.add(form);
    trackAnalyticsEvent('form_start', { form_name: formName(form) });
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    trackAnalyticsEvent('form_submit', { form_name: formName(form) });
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
  trackAnalyticsEvent('view_artwork', {
    content_type: 'artwork',
    content_id: analyticsText(`${tag}-${title}`.toLowerCase().replace(/[^a-z0-9]+/gi, '-'), 100),
    artwork_title: analyticsText(title),
    artwork_series: analyticsText(tag),
    artwork_medium: analyticsText(medium),
    artwork_format: analyticsText(format),
    artwork_year: analyticsText(year)
  });
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

/* ---- Langue du site : préférence visiteur + détection navigateur ---- */
(function () {
  const STORAGE_KEY = 'artistocratie-language';
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('lang');
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  const browserLanguages = navigator.languages || [navigator.language || 'fr'];
  const browserIsEnglish = browserLanguages.some(language => /^en([_-]|$)/i.test(language));
  const english = requested ? requested === 'en' : saved ? saved === 'en' : browserIsEnglish;

  const text = {
    'Œuvres': 'Works', 'Artiste': 'Artist', 'Collaborer': 'Collaborate', 'Retour à la galerie': 'Back to gallery',
    "Retour à l'accueil": 'Back to home', 'Découvrir les œuvres': 'Discover the works', "Découvrir l'artiste": 'Discover the artist',
    'Un cadeau pour toi': 'A gift for you', "Roulette d'artistes": 'Artist roulette',
    'La boutique': 'The shop',
    'Peinture & Dessin — Montréal': 'Painting & Drawing — Montréal', 'par Nino Minashvili': 'by Nino Minashvili',
    'À l’affiche · Dernier projet publié': 'Now showing · Latest project', 'LE MUR': 'THE WALL', 'EN MOUVEMENT': 'IN MOTION',
    'Une peinture par heure pendant 24 heures': 'One painting an hour for 24 hours',
    'Vingt-quatre peintures à l’huile sur papier, réalisées en vingt-quatre heures : une peinture par heure.': 'Twenty-four oil paintings on paper, made in twenty-four hours: one painting every hour.',
    'Défi des 24h · 2026': '24-hour challenge · 2026', 'Passer le mur': 'Skip the wall', 'Explorer le projet': 'Explore the project',
    'Accès exclusif': 'Exclusive access', 'Pssst! tu aimes les': 'Pssst! do you like', 'secrets': 'secrets',
    "Accède à l'intégralité de mes œuvres, celles que je ne montre pas sur les réseaux. Pièces intimes, pleines de sentiments, qui ne se montrent pas à n'importe qui.": 'Get access to all my works, including the ones I do not share on social media. Intimate pieces, full of feeling, not shown to just anyone.',
    'Rejoins le mouvement': 'Join the movement', "Je déteste les spams autant que toi. Un email de temps en temps, rien de plus.": 'I hate spam as much as you do. An email once in a while, nothing more.', '— Galerie privée —': '— Private gallery —',
    'La galerie': 'The gallery', "EXPLORER L'UNIVERS": 'EXPLORE THE UNIVERSE', '— l\'univers —': '— the universe —', 'Défi des 24h': '24-hour challenge', 'DÉFI DES 24H': '24-HOUR CHALLENGE', 'JUILLET · UNE PEINTURE PAR JOUR': 'JULY · ONE PAINTING A DAY', "Pastels à l'huile": 'Oil pastels', 'Collaborer ?': 'Collaborate?',
    'Retour au Défi de juillet': 'Back to the July Challenge', 'À emporter · Défi du mois de Juillet': 'Take it with you · July Challenge', 'UN CADEAU POUR TOI': 'A GIFT FOR YOU',
    'Six fragments peints au fil du mois : une peinture par jour, tout au long de juillet. Choisis celui qui te suit aujourd’hui, télécharge-le, puis fais-lui une place sur ton écran.': 'Six fragments painted over the month: one painting a day throughout July. Choose the one that follows you today, download it, and make room for it on your screen.',
    'Voir les deux versions →': 'View both versions →', 'Fermer': 'Close', 'Défi de juillet': 'July Challenge', 'Aperçu iPhone': 'iPhone preview', 'Fond nu': 'Clean wallpaper', 'Télécharger le fond d’écran': 'Download the wallpaper',
    'Challenge 01 · Juillet 2026': 'Challenge 01 · July 2026', 'PASTELS À L’HUILE': 'OIL PASTELS',
    'Un premier mois pour apprendre la discipline : une peinture par jour, tout au long de juillet.': 'A first month to learn discipline: one painting a day, throughout July.',
    'Le protocole': 'The protocol', 'UNE PEINTURE': 'ONE PAINTING', 'PAR JOUR.': 'A DAY.',
    'Mon premier challenge : peindre chaque jour de juillet, sans attendre l’inspiration parfaite. Une manière de laisser la matière guider le geste.': 'My first challenge: paint every day in July, without waiting for perfect inspiration. A way to let the material guide the gesture.',
    'œuvres révélées': 'works revealed', 'Juillet est encore en cours.': 'July is still in progress.', 'Journal de juillet': 'July journal', 'Molette ou doigt pour tourner · clique pour agrandir': 'Use the wheel or your finger to turn · click to enlarge', 'Fais glisser ou utilise la molette · toutes les œuvres sont là': 'Drag or use the wheel · every work is here', 'Défile pour faire tourner les œuvres · clique pour agrandir': 'Scroll to make the works turn · click to enlarge',
    'Série · Défi': 'Series · Challenge', '✦ Attrape les œuvres et déplace-les — clique pour les voir en grand': '✦ Grab the works and move them around — click to see them larger',
    "L'artiste": 'The artist', 'Peintre & presque ingénieure.': 'Painter & almost an engineer.', 'De la Géorgie à Montréal, en passant par la France.': 'From Georgia to Montréal, by way of France.', 'Qui suis-je ?': 'Who am I?', 'Peintre, Dessinatrice & Presque Ingénieure': 'Painter, Illustrator & Almost an Engineer',
    'Artiste peintre et dessinatrice, entre la Géorgie, la France et Montréal.': 'Painter and illustrator, between Georgia, France and Montréal.', 'À propos': 'About', 'Artiste peintre · Dessinatrice · Étudiante en ingénierie': 'Painter · Illustrator · Engineering student',
    'Nino Minashvili est une artiste peintre et dessinatrice d’origine géorgienne. Après avoir grandi en France, elle vit aujourd’hui à Montréal, où son parcours entre trois cultures nourrit une pratique attentive aux émotions, aux instants et aux souvenirs qui persistent.': 'Nino Minashvili is a painter and illustrator of Georgian origin. After growing up in France, she now lives in Montréal, where her journey across three cultures nourishes a practice attentive to emotions, moments and lasting memories.',
    'En parallèle de ses études d’ingénierie, elle développe un langage pictural fait de couleurs chaudes, de matière et de formes expressives. Sa peinture cherche à retenir ce qui échappe : une lumière, un mouvement, un état intérieur.': 'Alongside her engineering studies, she develops a visual language of warm colours, material and expressive forms. Her painting seeks to hold on to what escapes: a light, a movement, an inner state.',
    'À travers Artistocratie, Nino défend une vision de l’art comme nécessité : un langage sensible et universel, capable de créer du lien au-delà des frontières. Sa pratique se construit par séries, défis et expérimentations, avec le désir de partager des œuvres sincères et vivantes.': 'Through Artistocratie, Nino champions a vision of art as a necessity: a sensitive, universal language able to create connection beyond borders. Her practice takes shape through series, challenges and experimentation, with the desire to share works that are sincere and alive.',
    'Hello !': 'Hello!', "Moi c'est Nino, juste une fille qui aime créer des trucs.": "I'm Nino, just a girl who loves making things.",
    "Je suis originaire de Géorgie (oui, les grosses montagnes caucasiennes !) mais j'ai grandi en France.": 'I am from Georgia (yes, the big Caucasus mountains!) but I grew up in France.',
    "Ce mix de cultures m'a encouragée à découvrir le monde, et quoi de mieux que les années d'études pour partir à l'aventure ?": 'This mix of cultures encouraged me to discover the world, and what better time than student years to set out on an adventure?',
    "Sur mon temps libre, à côté de mes études d'ingénieure à Montréal, je peins des": 'In my free time, alongside my engineering studies in Montréal, I paint', 'émotions, des instants et des souvenirs': 'emotions, moments and memories',
    "qui résistent au temps. Mon univers mêle couleurs chaudes et formes expressives. C'est une façon de figer un instant et matérialiser les émotions.": 'that resist time. My world blends warm colours and expressive shapes. It is a way to hold a moment still and make emotions tangible.',
    "Artistocratie, c'est ma conviction que l'art n'est pas juste une décoration. C'est une": 'Artistocratie is my belief that art is not just decoration. It is a', 'nécessité': 'necessity', 'Un': 'A', 'langage universel': 'universal language',
    "Ce que j'aime": 'What I love', 'Les couleurs chaudes et la lumière': 'Warm colours and light', 'Voyager et croquer sur le vif': 'Travelling and sketching from life', 'Le jazz, le mouvement, l’improvisation': 'Jazz, movement, improvisation', "Les pastels à l'huile sous les doigts": 'Oil pastels under my fingers',
    "Ce qui m'anime": 'What drives me', 'Transmettre une émotion vraie': 'Sharing a real emotion', "Capturer l'instant qui résiste au temps": 'Capturing a moment that resists time', "Mêler l'art et l'ingénierie": 'Blending art and engineering', 'Me lancer des défis (24h, séries…)': 'Setting myself challenges (24 hours, series…)', 'Développer une pratique par séries et défis': 'Developing a practice through series and challenges',
    'Ce qui me définit': 'What defines me', 'Entre Géorgie, France & Montréal': 'Between Georgia, France & Montréal', "L'art comme nécessité, pas décoration": 'Art as necessity, not decoration', 'Spontanée, sensible, déterminée': 'Spontaneous, sensitive, determined', 'Un langage universel à partager': 'A universal language to share', 'Découvrir mes œuvres': 'Discover my work',
    'Projet · In situ': 'Project · In situ', 'MON APPART EN GALERIE': 'MY APARTMENT AS A GALLERY', 'Et si chaque mur d’un appartement devenait une cimaise ? Je transforme mon chez-moi en galerie vivante — l’art qui sort du cadre et habite le quotidien.': 'What if every apartment wall became an exhibition wall? I turn my home into a living gallery — art stepping out of the frame and into everyday life.',
    'Série · Voyage': 'Series · Travel', 'CARNET DE VOYAGE': 'TRAVEL SKETCHBOOK', 'Croquis pris sur le vif, entre la Géorgie, la France et Montréal. Des instants attrapés au fil des rues et des saisons.': 'Sketches made from life, between Georgia, France and Montréal. Moments caught along streets and seasons.',
    'Série · Musique': 'Series · Music', 'ÉDITION JAZZ': 'JAZZ EDITION', 'Née au rythme du jazz : improvisation, chaleur, mouvement. Chaque toile est une note posée sans filet, au feeling.': 'Born to the rhythm of jazz: improvisation, warmth, movement. Every canvas is a note placed without a safety net, by feel.',
    'Parlons-en': "Let's talk", 'ENVIE DE': 'WANT TO', 'COLLABORER ?': 'COLLABORATE?', 'Tu as un projet à illustrer, une idée à concrétiser, une commande, une expo, ou simplement l’envie de créer ensemble ? Partage-moi ton projet !': 'Do you have a project to illustrate, an idea to bring to life, a commission, an exhibition, or simply the wish to create together? Tell me about it!', 'Envoyer mon projet': 'Send my project', '— ou écris-moi directement —': '— or write to me directly —',
    'Le grand rêve': 'The big dream', 'Ce vers quoi tend tout mon travail. Le projet fou, celui que je porte en moi et qui prend forme, œuvre après œuvre. Bientôt réel — sois la première personne au courant.': 'What all my work is moving towards. The wild project I carry within me and that takes shape, work after work. Soon real — be the first to know.', 'Quelque chose de grand se prépare.': 'Something big is taking shape.', 'Rejoindre la liste privée': 'Join the private list',
    'Atelier · En cours': 'Studio · In progress', 'PROJETS EN COURS': 'PROJECTS IN PROGRESS', 'Ce qui est sur le chevalet en ce moment. Des pièces encore en mouvement, montrées en avant-première.': 'What is on the easel right now. Pieces still in motion, shown as a preview.',
    'Jeu · Défi de dessin': 'Game · Drawing challenge', "ROULETTE D'ARTISTES": 'ARTIST ROULETTE', 'La page blanche te nargue ? Lance la roulette. Elle tire un sujet, un style et une contrainte au hasard — à toi de relever le défi. Aucune excuse, juste le crayon.': 'Is the blank page taunting you? Spin the roulette. It picks a subject, a style and a constraint at random — your turn to take on the challenge. No excuses, just the pencil.',
    'Sujet': 'Subject', 'Style': 'Style', 'Défi': 'Challenge', 'Lancer la roulette': 'Spin the roulette', 'Copier le défi': 'Copy the challenge', 'LE MUR DES ARTISTES': 'THE ARTISTS’ WALL', 'Ce que la communauté a dessiné avec la roulette. Ajoute le tien — avec ton nom ou en anonyme.': 'What the community has drawn with the roulette. Add yours — with your name or anonymously.', 'Poster mon dessin': 'Post my drawing', 'Sois le premier à relever un défi et à l’afficher ici.': 'Be the first to take on a challenge and display it here.', 'Poste ton dessin': 'Post your drawing', '＋ Choisir une photo de ton dessin': '＋ Choose a photo of your drawing', 'Publier au mur': 'Publish to the wall',
    'Salle introuvable': 'Room not found', "CETTE ŒUVRE N'EXISTE PAS": 'THIS WORK DOES NOT EXIST', '« Le silence aussi est une trace. Cette page n’a jamais été peinte — ou elle a déjà été retirée du musée. »': '“Silence, too, leaves a trace. This page was never painted — or it has already been removed from the museum.”'
  };
  const attributes = {
    'Navigation principale': 'Main navigation', 'Séries et projets': 'Series and projects', 'Défi des 24h': '24-hour challenge', 'Juillet — une peinture par jour': 'July — one painting a day', 'Fonds d’écran Artistocratie': 'Artistocratie wallpapers', 'Fermer': 'Close', 'Voir les deux versions du fond d’écran, jour 01': 'View both versions of the wallpaper, day 01',
    'Voir les deux versions du fond d’écran, jour 09': 'View both versions of the wallpaper, day 09', 'Voir les deux versions du fond d’écran, jour 11': 'View both versions of the wallpaper, day 11', 'Voir les deux versions du fond d’écran, jour 12': 'View both versions of the wallpaper, day 12', 'Voir les deux versions du fond d’écran, jour 16': 'View both versions of the wallpaper, day 16', 'Voir les deux versions du fond d’écran, jour 23': 'View both versions of the wallpaper, day 23',
    'Versions du fond d’écran': 'Wallpaper versions', 'Voir le fond d’écran précédent': 'View previous wallpaper', 'Voir le fond d’écran suivant': 'View next wallpaper'
  };
  const titles = {
    'index.html': 'Artistocratie — Nino Minashvili · Painting & Drawing · Montréal', 'oeuvres.html': 'Works — Artistocratie · Nino Minashvili', 'artiste.html': 'The artist — Nino Minashvili · Artistocratie', 'defi-24h.html': 'One painting an hour for 24 hours — Artistocratie', 'pastels-huile.html': 'Oil pastels — Artistocratie', 'fonds-ecran.html': 'Download wallpapers — Artistocratie', 'roulette.html': 'Artist roulette — Artistocratie', 'collaborer.html': 'Collaborate — Artistocratie', 'appart-galerie.html': 'My apartment as a gallery — Artistocratie', 'carnet-voyage.html': 'Travel sketchbook — Artistocratie', 'edition-jazz.html': 'Jazz edition — Artistocratie', 'projets-en-cours.html': 'Projects in progress — Artistocratie', 'my-dream.html': 'My Dream — Artistocratie', '404.html': 'Page not found — Artistocratie'
  };

  const translate = value => {
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    const key = value.trim();
    if (!key) return value;
    if (text[key]) return `${leading}${text[key]}${trailing}`;
    if (/^Défi de juillet · Jour \d+$/.test(key)) return `${leading}${key.replace('Défi de juillet · Jour', 'July Challenge · Day')}${trailing}`;
    if (/^Jour \d+$/.test(key)) return `${leading}${key.replace('Jour', 'Day')}${trailing}`;
    if (/^Juillet 2026 · pastel à l’huile sur papier$/.test(key)) return `${leading}July 2026 · oil pastel on paper${trailing}`;
    if (/^\d+(e|er) œuvre du challenge : une peinture par jour, tout au long de juillet\.$/.test(key)) return `${leading}${key.replace(/^(\d+)(e|er) œuvre.*$/, '$1 work from the challenge: one painting a day throughout July.')}${trailing}`;
    return value;
  };
  const translateNode = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentElement;
      if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
        const translated = translate(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;
    node.childNodes.forEach(translateNode);
    ['aria-label', 'alt', 'placeholder', 'title'].forEach(attribute => {
      const value = node.getAttribute(attribute);
      const translated = value && attributes[value];
      if (translated && translated !== value) node.setAttribute(attribute, translated);
    });
  };
  const toggle = () => {
    const nav = document.getElementById('navbar');
    if (!nav || document.getElementById('languageToggle')) return;
    const button = document.createElement('button');
    button.id = 'languageToggle'; button.className = 'language-toggle';
    button.type = 'button'; button.textContent = english ? 'FR' : 'EN';
    button.setAttribute('aria-label', english ? 'Afficher le site en français' : 'View the site in English');
    button.addEventListener('click', () => {
      trackAnalyticsEvent('language_change', { language_from: english ? 'en' : 'fr', language_to: english ? 'fr' : 'en' });
      try { localStorage.setItem(STORAGE_KEY, english ? 'fr' : 'en'); } catch (_) {}
      window.location.reload();
    });
    nav.append(button);
  };

  if (!english) { toggle(); return; }
  document.documentElement.lang = 'en';
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (titles[file]) document.title = titles[file];
  translateNode(document.body);
  toggle();
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'characterData') translateNode(record.target);
    record.addedNodes.forEach(translateNode);
  })).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
