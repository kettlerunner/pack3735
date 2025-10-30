# AGENTS.md — Pack 3735 Website

## 1) Context & Goals
Static site for Cub Scout Pack 3735; purpose is recruitment, events, and parent info. Priority: clarity > accessibility > performance > flair. No dark patterns or tracking.

## 2) Tech Constraints
- Plain HTML/CSS/JS; no build step; keep repo free of package managers.
- Host: DigitalOcean droplet, nginx serving `/var/www/pack3735`.
- Images: store under `assets/` with lowercase-kebab filenames, compressed, `loading="lazy"`.

## 3) Design Tokens (see `css/styles.css`)
- `--blue:#003F87`, `--gold:#FCD116`, `--pale:#9AB3D5`, `--gray:#515354`,
  `--bg:#ffffff`, `--ink:#0b0b0b`.
- Typography: system UI stack; scale 14/16/20/28/36.
- Components: `.btn`, `.card`, `.hero`—reuse classes; no inline styles.

## 4) Repo Map & Edit Policy
- `index.html` — **EDIT**
- `partials/` (`header.html`, `footer.html`, `hero.html`, section fragments) — **EDIT**
- `css/styles.css` — **EDIT** (extend via utility classes; keep tokens intact)
- `js/` — **EDIT** (progressive enhancement only)
- `games/` — **EDIT** (self-contained pages)
- `popcorn/` — **EDIT** (landing pages & assets)
- `pack_3735_flat_site_index.html` — **READ-ONLY** (historical)
- `nginx/*` — **OUT OF SCOPE**

## 5) Content Guardrails
- Voice: friendly, concise, parent-focused; no jargon; grade-5 reading level.
- Youth protection: no personal info or photos of minors without consent; no tracking pixels.
- Accessibility: alt text, headings in order, focusable controls, color contrast ≥ 4.5:1.
- SEO basics: one `<h1>` per page; meta title ≤ 60 chars; meta description 140–160 chars.
- Links to external services open same tab unless it’s a long form / payment (then new tab).
- `timer.html` is a personal utility page; keep it out of navigation, exclude it from sitemaps/search, and mark it `noindex` so engines don’t crawl it.

## 6) Common Task Recipes
### A) Popcorn Sales Landing Page
- Create `partials/popcorn.html` with:
  - Hero: image of popcorn + diagonal blue gradient stripe; CTA “Order Popcorn”.
  - Sections: “Why popcorn supports Scouts”, product highlights, FAQs, contact.
  - Reusable CTA snippet: `partials/cta_popcorn.html`.
- Wire up:
  - Add nav item in `partials/header.html`.
  - Feature card on `index.html` “Campaigns” row.
- Accept criteria:
  - Lighthouse a11y ≥ 90; all images have `alt`; mobile hero loads < 2s on 4G.

### B) Update Hero Artwork
- Edit `partials/hero.html`; keep headline placeholder `{{HERO_TITLE}}`.
- Add gradient stripe background via CSS class `.hero--stripe`.
- Do not place text in images; keep text live for a11y/SEO.

### C) New Game Page
- Copy `games/template.html` → `games/<slug>.html`.
- Add route link in `partials/nav_games.html`.
- Include short “What you learn” box and a share button.

## 7) Quality Gates
- Validate HTML (W3C), check broken links.
- Image weights reasonable (<300KB hero, <120KB others).
- Manual keyboard nav test: tab order works; visible focus.

## 8) Commit & PR
- Conventional Commits, present tense, e.g. `feat(popcorn): add landing page and CTA`.
- PR template checklist: a11y done, links checked, images compressed.

## 9) Variables & Placeholders
- `{{ORDER_URL}}`, `{{HERO_TITLE}}`, `{{EVENT_FEED_URL}}`. Leave placeholders intact unless values are provided.

## 10) Out-of-Scope / Hard NOs
- Do not add JS trackers, analytics, or external fonts without approval.
- Do not change nginx/server configs.
- Do not upload photos of minors or embed social feeds without prior review.

## 11) Quick Deploy
- Static edit → verify in browser → `sudo nginx -t && sudo systemctl reload nginx`.
- Rollback = restore previous file versions.

