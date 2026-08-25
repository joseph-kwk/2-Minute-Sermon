# 2-Minute Sermon 🕊️

> **Short, scripture-rooted messages. Delivered worldwide in 120 seconds.**

A modern web platform for the 2-Minute Sermon ministry — delivering bite-sized, scripture-first sermons to a global audience with a pastoral, premium feel.

[![Live Site](https://img.shields.io/badge/Live-2minutesermon.org-C62828?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.2minutesermon.org)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Deployment Guide](https://img.shields.io/badge/Guide-Deployment%20%26%20Admin-059669?style=for-the-badge&logo=markdown&logoColor=white)](./DEPLOYMENT_AND_ADMIN_GUIDE.md)

---

> 📖 **Need deployment or domain setup instructions?** Read the detailed [**Deployment & Admin Guide**](./DEPLOYMENT_AND_ADMIN_GUIDE.md).

---

## Features

### Public Site
- **Hero Section** — Featured sermon carousel with live stats (sermons, ministers, countries)
- **Sermon Library** — Searchable, filterable grid by season, topic, preacher, and scripture book
- **Interactive Sermon Modal** — YouTube embed with timestamped transcript for every message
- **Daily Verse** — Auto-displays the scheduled verse for today; includes listen aloud (TTS), copy, and share
- **Liturgical Seasons Hub** — Browse sermons by Advent, Lent, Easter, Ordinary Time, and more
- **Topics Hub** — Filter by Faith, Healing, Grace, Prayer, and other pastoral themes
- **Preachers Directory** — Profile cards for all contributing ministers worldwide
- **Ministry Events** — Minimal upcoming gatherings view with one-click sharing (no registration barrier)
- **Prayer Wall** — Submit personal prayer requests; written communal prayers
- **About** — Mission, vision, impact metrics, and statement of faith
- **Newsletter Signup** — Email subscription for daily/weekly devotionals
- **Share Integration** — Native Web Share API + clipboard fallback for every sermon & event

### The Steward Portal (`/admin.html`)
Opens in a dedicated browser tab with full authentication:

| Panel | Capability |
|---|---|
| **Dashboard** | Live stats: sermons, verses, ministers, events, pending prayers |
| **Daily Verse Scheduler** | Plan verses by date; 30-day auto-fill queue |
| **Sermon Publisher** | Paste YouTube URL → live preview → publish to library |
| **Preachers Manager** | Add/remove minister profiles with photo, bio, denomination |
| **Events Manager** | Create, manage, and publish upcoming ministry events |
| **Prayer Inbox** | Review visitor prayer requests; mark as "Prayed For" |
| **CMS Backup** | JSON export & validated import to restore or sync CMS data |
| **Ministry Settings** | Set recipient emails & Formspree/Web3Forms endpoint for contact & newsletter forms |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Bundler** | [Vite 5](https://vitejs.dev) — multi-page build (`index.html` + `admin.html`) |
| **Languages** | HTML5, Vanilla CSS, ES Modules (JavaScript) |
| **Typography** | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (body) via Google Fonts |
| **Design System** | Custom CSS variables (tokens), glassmorphism, `backdrop-filter` |
| **Animations** | `IntersectionObserver` scroll-reveal, staggered grid entrances, CSS keyframes |
| **Auth** | Client-side password gate (replace with Firebase Auth / backend in production) |
| **Icons** | Inline SVG — no icon library dependency |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Clone the repository
git clone https://github.com/joseph-kwk/2-Minute-Sermon.git
cd 2-Minute-Sermon

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the public site.  
Open [http://localhost:5173/admin.html](http://localhost:5173/admin.html) for The Steward.

### Build for Production

```bash
npm run build
```

Output is in `dist/` — ready to deploy to any static host (Netlify, Vercel, Firebase Hosting, GitHub Pages).

---

## 📁 Project Structure

```
2-Minute-Sermon/
├── index.html              # Main public site
├── admin.html              # The Steward Portal (separate page)
├── vite.config.js          # Multi-page Vite config
├── public/
│   └── assets/
│       ├── logo.png        # Ministry logo
│       └── hero-bg.jpg     # Hero section background
└── src/
    ├── app.js              # Main site logic (scroll-reveal, nav, CMS hooks)
    ├── admin.js            # The Steward logic (auth, panels, CRUD)
    ├── style.css           # Public site design system
    ├── admin.css           # The Steward styles
    └── data/
        ├── sermons.js      # Sermon library data
        ├── preachers.js    # Minister profiles
        ├── dailyVerse.js   # Scheduled daily verse queue
        ├── seasons.js      # Liturgical seasons
        ├── topics.js       # Sermon topic categories
        └── events.js       # Upcoming ministry events store
```

---

## Design System

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--color-sermon-red` | `#C62828` | Primary brand / CTAs |
| `--color-gold` | `#D97706` | Accents, stats, highlights |
| `--color-charcoal` | `#161616` | Dark backgrounds, headings |
| `--color-offwhite` | `#FAFAFA` | Page background |

### Animations
- **Scroll-reveal**: `IntersectionObserver` with 0.1 threshold + 40px root margin
- **Staggered grids**: Each card child staggers `0–0.6s` via `:nth-child` CSS delays
- **Logo title**: Letter-by-letter rise animation on page load (48ms per character)
- **View transitions**: `fadeSlide` keyframe on every section switch
- **Hero shimmer**: Radial gradient pulse on the hero overlay

---

## 🔐 The Steward Access

> **Warning:** Never commit credentials to this repository. Store passwords in a `.env` file (already listed in `.gitignore`) or use a proper auth provider (Firebase Auth, NextAuth, etc.) before going live.

The Steward portal is protected by a password gate. See your `.env` or deployment environment for the configured credential.

| Field | Value |
|---|---|
| URL | `/admin.html` (opens in new tab) |
| Password | *(set via environment — not stored here)* |

---

## Scripture Foundation

> *"Go into all the world and preach the gospel to every creature."*  
> — **Mark 16:15**

---

## Contributing

This is an active ministry project. For partnership, content contributions, or technical collaboration, please reach out through [2minutesermon.org](https://www.2minutesermon.org).

---

## License

© 2-Minute Sermon Ministry. All rights reserved.
