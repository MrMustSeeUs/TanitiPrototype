# 🌺 Taniti Island — Tourism Website

A fully responsive, multi-page tourism website for the fictional island of Taniti.
Built as a portfolio project demonstrating production-grade skills across **software engineering, cloud infrastructure, DevOps automation, and web security**.

**[🔗 Live Demo](https://taniti-island.mrabrahammacias.workers.dev)** · **[📊 Uptime Status](https://stats.uptimerobot.com/cepQG2Mmhh)** · **[📋 Report a Bug](https://github.com/MrMustSeeUs/TanitiPrototype/issues)**

![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square)
![Uptime](https://img.shields.io/badge/Uptime-Monitored-51B749?style=flat-square&logo=uptimerobot)
![HTTPS](https://img.shields.io/badge/HTTPS-Enforced-0088CC?style=flat-square&logo=cloudflare)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions)
![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-0057B8?style=flat-square)

---

## ✨ Features

- **5-page multi-layout site** — Home, About, Explore, Plan Your Visit, FAQ
- **Interactive trip planner** — generates a personalized day-by-day itinerary based on dates and interests
- **Live weather widget** — real 5-day forecast via [Open-Meteo API](https://open-meteo.com) (free, no API key)
- **Live currency converter** — real exchange rates via [open.er-api.com](https://open.er-api.com) updated on every load
- **FAQ search** — real-time keyword search with highlight across 30+ questions
- **Gallery lightbox** — full-screen image viewer with keyboard navigation
- **Interactive map** — filterable location pins by category
- **Countdown timer** — live countdown to upcoming island events
- **Fully responsive** — tested from 360px to 1800px+
- **Accessibility-first** — skip links, ARIA landmarks, `aria-live` regions, keyboard navigation, WCAG 2.1 AA

---

## 🛠️ Built With

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Design System** | Custom CSS — Playfair Display + Nunito, CSS variables, 4 shadow levels, gradient tokens |
| **Cloud** | Cloudflare Workers — global CDN, automatic HTTPS, DDoS protection |
| **CI/CD** | GitHub Actions — HTML validation, link checking, asset audits, auto-deploy on every push |
| **Security** | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, GitHub Secrets |
| **Monitoring** | [UptimeRobot](https://stats.uptimerobot.com/cepQG2Mmhh) — 5-minute interval checks, email alerts |
| **Performance** | All 50 assets compressed to under 200KB (90MB → 7.4MB), `loading="lazy"` throughout |
| **SEO** | `robots.txt`, `sitemap.xml`, semantic HTML, meta descriptions on every page |

---

## 🚀 Getting Started

No build tools or dependencies required — pure HTML, CSS, and JavaScript.

```bash
# Clone the repository
git clone https://github.com/MrMustSeeUs/TanitiPrototype.git
cd TanitiPrototype

# Open in browser (Option A — direct file)
open index.html

# Open in browser (Option B — local dev server, avoids CORS issues)
npx serve .
```

---

## 📁 Project Structure

```
TanitiPrototype/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD — validate, check, deploy on every push
├── Assets/                   # 50 optimized images — all under 200KB
├── index.html                # Homepage
├── about.html                # Island geography, culture & history
├── explore.html              # Dining, shopping, activities & entertainment
├── plan.html                 # Trip planner, accommodations & transportation
├── faq.html                  # Searchable FAQ with 30+ questions
├── coming-soon.html          # Friendly beta page for unbuilt routes
├── scripts.js                # 15 independent JS modules
├── styles.css                # Full design system — 3,000+ lines
├── robots.txt                # Search engine crawl rules
├── sitemap.xml               # All 6 pages submitted for SEO indexing
├── _headers                  # Cloudflare security headers
└── wrangler.jsonc            # Cloudflare Workers deployment config
```

---

## 🔒 Security

| Practice | Implementation |
|---|---|
| No secrets in source | All credentials stored in GitHub Encrypted Secrets |
| Content Security Policy | Blocks unauthorized scripts, styles, and connections |
| X-Frame-Options | Prevents clickjacking — site cannot be embedded in iframes |
| X-Content-Type-Options | Prevents MIME-type sniffing attacks |
| Referrer-Policy | Controls referrer data sent to third parties |
| Permissions-Policy | Disables camera, microphone, geolocation, and payment APIs |
| Input sanitization | All user input escaped before DOM insertion |
| WCAG 2.1 AA | Accessible to users with visual, motor, and cognitive impairments |

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers the full pipeline automatically:

```
git push origin main
        ↓
✅ HTML validation (html-validate)
✅ Internal link checker — catches broken hrefs
✅ Asset reference checker — catches missing images
✅ File size audit — warns on assets over 1MB
        ↓
🚀 Deploy to Cloudflare Workers
        ↓
🌐 Live in under 2 minutes
```

---

## 📊 Performance

| Metric | Before | After |
|---|---|---|
| Total asset size | 90MB | 7.4MB |
| Largest image | 5.5MB | 181KB |
| Files over 200KB | 43 | 0 |
| Image loading | Eager (all) | Lazy (below fold) |
| Encoding | Standard | Progressive JPEG |

---

## 🗺️ Completed Roadmap

### ✅ Sprint 1 — Code Quality & Design
- [x] Fix duplicate `DOMContentLoaded` bug
- [x] Fix broken map image path and asset filename casing
- [x] Dynamic copyright year — auto-updates annually
- [x] Professional CSS design system — Tropical Editorial aesthetic
- [x] Full accessibility pass — WCAG 2.1 AA, skip links, ARIA landmarks
- [x] Responsive layouts from 360px to 1800px+
- [x] Interactive trip planner with day-by-day itinerary generation
- [x] Coming-soon page for all unbuilt routes with contextual messaging

### ✅ Sprint 2 — Cloud & DevOps
- [x] Deployed to Cloudflare Workers — global CDN, automatic HTTPS
- [x] GitHub Actions CI/CD pipeline — 4-step validation before every deploy
- [x] Asset filename normalization for Linux/Cloudflare case-sensitivity
- [x] Security headers via `_headers` file — 6 headers on every response

### ✅ Sprint 3 — Live Data & SEO
- [x] Live weather — Open-Meteo API, 5-day forecast, graceful fallback
- [x] Live currency rates — open.er-api.com, updates on every page load
- [x] `robots.txt` — crawler rules and sitemap pointer
- [x] `sitemap.xml` — all 6 pages with priorities and change frequencies

### ✅ Sprint 4 — Performance & Monitoring
- [x] UptimeRobot monitoring — [live status page](https://stats.uptimerobot.com/cepQG2Mmhh)
- [x] Image optimization — 90MB → 7.4MB, all 50 assets under 200KB
- [x] Progressive JPEG encoding for faster perceived load
- [x] `loading="lazy"` and `decoding="async"` on all below-fold images
- [x] Converted `interactivemap.png` to JPEG (1.1MB → 102KB)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: describe your change'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Abraham Macias**
- GitHub: [@MrMustSeeUs](https://github.com/MrMustSeeUs)
- LinkedIn: [mrabemacias](https://www.linkedin.com/in/mrabemacias/)
- Location: Evans, Colorado

---

_Built with purpose. Deployed with care. Secured by design._