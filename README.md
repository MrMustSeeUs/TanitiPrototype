# 🌺 Taniti Island — Tourism Website

A fully responsive, multi-page tourism website for the fictional island of Taniti.
Built as a portfolio project to demonstrate front-end development, cloud deployment,
CI/CD automation, and web security best practices.

**[🔗 Live Demo](https://taniti-island.mrabrahammacias.workers.dev)** · **[📋 Report a Bug](https://github.com/MrMustSeeUs/TanitiPrototype/issues)** · **[✨ Request a Feature](https://github.com/MrMustSeeUs/TanitiPrototype/issues)**

---

## 📸 Screenshots

> **🌐 [View Live Site](https://taniti-island.mrabrahammacias.workers.dev)**

---

## ✨ Features

- **Multi-page layout** — Home, About, Explore, Plan Your Visit, and FAQ
- **Interactive trip planner** — Build a day-by-day itinerary with drag-and-drop activities
- **Gallery lightbox** — Full-screen image viewer with keyboard navigation (arrow keys + Escape)
- **FAQ search** — Real-time search with keyword highlighting across all FAQ categories
- **Currency converter** — Convert between USD, EUR, GBP, JPY, and the fictional Taniti Dollar
- **Weather widget** — live 5-day forecast via [Open-Meteo API](https://open-meteo.com) — free, no API key required
- **Interactive map** — Clickable location pins with category filtering
- **Countdown timer** — Live countdown to upcoming island events
- **Mobile responsive** — Fully functional hamburger menu and fluid layouts on all screen sizes
- **Accessibility-first** — ARIA attributes, keyboard navigation, and semantic HTML throughout

---

## 🛠️ Built With

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Styling | Custom CSS design system with CSS variables |
| Deployment | Cloudflare Workers with global CDN + automatic HTTPS |
| CI/CD | GitHub Actions — auto-deploy on every push to `main` |
| Security | CSP headers, GitHub Secrets, WCAG 2.1 AA, OWASP practices |
| Monitoring | UptimeRobot uptime alerts *(Sprint 4)* |

---

## 🚀 Getting Started

No build tools or dependencies required. This is pure HTML, CSS, and JavaScript.

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/MrMustSeeUs/TanitiPrototype.git

# 2. Navigate into the project folder
cd TanitiPrototype

# 3. Open in your browser
# Option A — just double-click index.html in your file explorer
# Option B — use a local dev server for best results (no CORS issues)
npx serve .
```

> 💡 **Tip:** Using `npx serve .` gives you a local server at `http://localhost:3000`
> and avoids browser security restrictions that can block local file access.

---

## 📁 Project Structure

```
TanitiPrototype/
├── Assets/               # All images used across the site
├── index.html            # Homepage — hero, feature cards, events, weather snapshot
├── about.html            # About Taniti — geography, culture, history
├── explore.html          # Things to do — dining, beaches, activities, shopping
├── plan.html             # Plan your visit — trip planner, accommodations, transport
├── faq.html              # FAQ — searchable, tabbed accordion with 30+ questions
├── scripts.js            # All JavaScript — 15 independent feature modules
├── styles.css            # All CSS — design system built on CSS custom properties
└── .hintrc               # webhint configuration for code quality checks
```

---

## 🗺️ Project Roadmap

### ✅ Sprint 1 — Code Quality (Complete)
- [x] Fix duplicate `DOMContentLoaded` bug
- [x] Fix broken map image path
- [x] Dynamic copyright year (auto-updates every year)
- [x] Normalize all asset filenames to `lowercase-hyphenated` convention
- [x] Professional inline documentation throughout `scripts.js`
- [x] This README

### ✅ Sprint 2 — Cloud & DevOps (Complete)
- [x] Deploy to Cloudflare Workers with automatic HTTPS
- [x] GitHub Actions CI/CD pipeline — auto-deploy on every push to `main`
- [x] HTML validation, internal link checker, asset reference checker in pipeline
- [x] Asset filename normalization — lowercase for Linux/Cloudflare compatibility

### ✅ Sprint 3 — Live Data (Complete)
- [x] Live weather data via Open-Meteo API — free, no API key, 5-day forecast
- [x] Live currency rates via open.er-api.com — updates on every page load
- [x] `robots.txt` — search engine crawl rules
- [x] `sitemap.xml` — all 6 pages indexed for SEO
- [x] Security headers — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### 📋 Sprint 4 — Monitoring & Polish
- [ ] UptimeRobot uptime monitoring
- [ ] Sentry error tracking
- [ ] Dependabot automated security alerts
- [ ] Create missing pages: `contact.html`, `events.html`, `terms.html`, `privacy.html`

---

## 🔒 Security

This project follows OWASP best practices for front-end security:

- No API keys or secrets stored in the codebase
- User input is sanitized before DOM insertion
- Security headers enforced at the CDN layer — CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy
- Automated dependency vulnerability scanning via Dependabot — _coming Sprint 4_

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
Feel free to check the [issues page](https://github.com/MrMustSeeUs/TanitiPrototype/issues).

1. Fork the project
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 👤 Author

**Abraham Macias**
- GitHub: [@MrMustSeeUs](https://github.com/MrMustSeeUs)
- Location: Evans, Colorado

---

## 📄 License

CC BY-NC 4.0

_Built with purpose. Deployed with care. Secured by design._
