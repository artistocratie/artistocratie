# Artistocratie

Site officiel de **Nino Minashvili** — peinture, dessin, art numérique.
En ligne sur **[artistocratie.com](https://artistocratie.com)**.

## Stack
- HTML / CSS / JS vanilla (zero build, zero dépendance)
- Hébergement : GitHub Pages (branche `main`, root `/`)
- Newsletter : Mailchimp (intégrée dans la section *Œuvres exclusives*)
- Domaine custom via `CNAME`

## Structure

```
.
├── index.html              # ACCUEIL : 2 choix (Œuvres / Artiste) + newsletter
├── artiste.html            # Bio de Nino
├── oeuvres.html            # HUB : 8 boutons en cercle autour d'un médaillon central
│   ├── defi-24h.html
│   ├── appart-galerie.html
│   ├── edition-jazz.html
│   ├── carnet-voyage.html
│   ├── pastels-huile.html
│   ├── projets-en-cours.html
│   ├── projets-a-venir.html
│   └── collaborer.html     # page contact / collaboration
├── 404.html                # Page d'erreur custom
├── CNAME                   # artistocratie.com
├── favicon.{ico,svg}
└── assets/
    ├── css/style.css       # Styles (palette claire, orange #FF5400)
    ├── js/main.js          # Interactions partagées (null-safe, multi-pages)
    └── img/
        ├── hero.webp · toiles/ · posters/ · carnets/
```

## Développement local

```bash
# Servir le site sur http://localhost:8000
python3 -m http.server 8000
```

Pas de build, pas de hot reload — c'est volontaire.

## Ajouter une œuvre

1. Optimiser l'image : `cwebp -q 80 -resize 1600 0 source.jpg -o assets/img/toiles/toile-XX.webp`
2. Ajouter une entrée dans la `col-grid` de la page de série correspondante (ex. `carnet-voyage.html`)
3. Commit + push → GitHub Pages déploie automatiquement (~30s)

## Réseaux

- Instagram : [@artistocratie_](https://instagram.com/artistocratie_)
- TikTok : [@artistocratie_](https://tiktok.com/@artistocratie_)
- Contact : artistocratie.art@gmail.com

© 2026 Nino Minashvili
