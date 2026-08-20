# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SOMA — Ayurvedic Period Tracking App

**Developer:** Shailja Dubey (non-technical founder, Berlin, Germany)
**Live URL:** https://www-nine-gilt.vercel.app
**Stack:** HTML, CSS, JavaScript — deployed on Vercel
**Status:** MVP live, not yet on App Store / Play Store

## About the App

Soma is an Ayurvedic period tracking Progressive Web App (PWA). It tracks menstrual phases (Menstrual, Follicular, Ovulation, Luteal) and provides Ayurvedic guidance: Ahara (diet), Aushadhi (herbs), Yoga, and Dinacharya (daily rituals) tailored to each phase. The store listing names the app "Sakhi" — the codebase uses "Soma" internally.

## Legal Requirements (CRITICAL — Do Not Skip)

- Based in Germany → GDPR applies to ALL user data
- The app collects health data (menstrual cycles) → Article 9 GDPR (special category)
- Impressum is LEGALLY REQUIRED on the site (already created)
- Privacy Policy must explain data storage location and duration
- No cookies or tracking without explicit consent
- Do NOT add third-party scripts without asking first

## My Working Style

- Explain things in plain English before writing any code
- Tell me WHICH FILE you are changing and WHY before changing it
- Always specify: "Run this IN TERMINAL" or "Type this IN CLAUDE CODE"
- Never change the Impressum or Privacy Policy without explicit approval
- After each task, tell me: what changed, what file, and what to do next

## Commands

```bash
# Development — copy source files to www/ without minification
npm run build:dev

# Production build — minifies HTML/CSS/JS into www/
npm run build

# Sync web build to native iOS/Android via Capacitor
npm run sync

npm run open:ios      # Open in Xcode
npm run open:android  # Open in Android Studio
```

To preview locally, open `www/index.html` directly in a browser — no dev server needed.

## Architecture

**Single-file app:** All HTML, CSS, and JavaScript live in `index.html` (~1700 lines). No framework, no bundler — vanilla JS with inline styles and scripts.

**State management:** A single `state` object holds `periodStart`, `cycleLength`, `periodDuration`, `viewYear`, `viewMonth`. Persisted to `localStorage` via `saveState()`/`loadState()`. Daily check-ins stored separately under `soma_checkin_YYYY-MM-DD` keys.

**Phase logic:** The `PHASES` object at the top of the `<script>` block is the core data structure — each phase has its key, colors, dosha, Sanskrit name, and all Ayurvedic content (food, herbs, yoga, rituals, shlokas). `getPhaseForCycleDay()` maps a cycle day to a phase key.

**Phase colours:** Menstrual `#c9748c`, Follicular `#7bc98c`, Ovulation `#c9b47b`, Luteal `#7b8ec9`. Always check that changes do not break the Cycle Wheel visualisation (Canvas-based).

**Rendering:** No reactive framework. DOM is updated through explicit render functions (`renderPhaseHero`, `renderCalendar`, `renderStats`, `renderPhasesOverview`, `renderShastra`, `renderAyurveda`). `renderAll()` is the main refresh entry point.

**Global onclick functions:** `saveCycle`, `clearAll`, `toggleMood`, `toggleSymptom`, `saveCheckin`, `switchTab`, `prevMonth`, `nextMonth`, `switchPhaseView`, `showToast` are called from HTML `onclick` attributes. The build script's JS mangler has these reserved — do not rename them without updating `build-prod.js`.

**Build pipeline:** `build-prod.js` minifies source files into `www/` using `html-minifier-terser` (JS mangling on, `console.log` stripped). `www/` is what Capacitor bundles and what Vercel serves.

**Service worker:** `sw.js` is a cache-first PWA service worker. Cache name is `soma-v1` — increment when deploying changes that must bypass cached assets.

**Mobile-first:** Design targets 375px width minimum. Test all changes at this viewport.

**Localisation:** All on-screen text must support both English and future German translation.
