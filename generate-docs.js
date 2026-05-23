// Sakhi — Project Documentation Generator
// Copyright (c) 2026 Shailja Dubey. All Rights Reserved.

const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents
} = require('docx');

// ─── Color Constants ───────────────────────────────────────
const COLORS = {
  blue: "1F4E79",
  green: "2E7D32",
  orange: "E65100",
  red: "C62828",
  purple: "6A1B9A",
  gold: "C9A96E",
  dark: "3A3535",
  cream: "F7F3EE",
  gray: "F5F5F5",
  grayText: "757575",
  menstrual: "C27C7E",
  follicular: "6B9E80",
  ovulation: "C9A067",
  luteal: "8E7EB5",
  white: "FFFFFF",
  border: "CCCCCC",
  lightBlue: "D6E4F0",
  lightGreen: "E8F5E9",
  lightOrange: "FFF3E0",
  lightPurple: "F3E5F5",
  lightRed: "FFEBEE",
  lightGray: "EEEEEE",
};

const PAGE_WIDTH = 12240; // US Letter
const MARGIN = 1440; // 1 inch
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 9360 DXA
const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ─── Helper Functions ──────────────────────────────────────
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: COLORS.blue, font: "Georgia" })],
  });
}

function heading2(text, color = COLORS.dark) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color, font: "Georgia" })],
  });
}

function heading3(text, color = COLORS.dark) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color, font: "Georgia" })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({
      text,
      size: 22,
      font: opts.font || "Georgia",
      color: opts.color || COLORS.dark,
      bold: opts.bold || false,
      italics: opts.italic || false,
    })],
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120 },
    children: runs.map(r => new TextRun({
      text: r.text,
      size: r.size || 22,
      font: r.font || "Georgia",
      color: r.color || COLORS.dark,
      bold: r.bold || false,
      italics: r.italic || false,
    })),
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
    children: [new TextRun({
      text,
      size: 18,
      font: "Courier New",
      color: COLORS.dark,
    })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function colorDot(label, hexColor) {
  return richPara([
    { text: "● ", color: hexColor, size: 24, font: "Arial" },
    { text: label, size: 22 },
  ]);
}

function makeRow(cells, headerRow = false) {
  return new TableRow({
    children: cells.map((cell, i) => {
      const widths = cells._widths || null;
      return new TableCell({
        borders,
        margins: cellMargins,
        width: widths ? { size: widths[i], type: WidthType.DXA } : undefined,
        shading: headerRow ? { fill: COLORS.blue, type: ShadingType.CLEAR } : { fill: COLORS.white, type: ShadingType.CLEAR },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            size: 20,
            font: "Arial",
            color: headerRow ? COLORS.white : COLORS.dark,
            bold: headerRow,
          })],
        })],
      });
    }),
  });
}

function makeTable(headers, rows, colWidths) {
  const headerCells = headers;
  headerCells._widths = colWidths;
  const headerRowObj = makeRow(headerCells, true);

  const dataRows = rows.map(r => {
    r._widths = colWidths;
    return makeRow(r, false);
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRowObj, ...dataRows],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.gold, space: 1 } },
    children: [],
  });
}

// ─── Build the Document ────────────────────────────────────
async function generateDocs() {
  const children = [];

  // ─── COVER PAGE ──────────────────────────────────────────
  children.push(new Paragraph({ spacing: { before: 3000 }, children: [] }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "SAKHI", size: 72, bold: true, color: COLORS.gold, font: "Georgia" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Ayurvedic Cycle Tracker", size: 36, color: COLORS.dark, font: "Georgia" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Complete Project Documentation", size: 28, color: COLORS.grayText, font: "Georgia", italics: true })],
  }));
  children.push(divider());
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Author: Shailja Dubey", size: 24, color: COLORS.dark, font: "Georgia" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Location: Berlin, Germany", size: 22, color: COLORS.grayText, font: "Georgia" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Version 1.0 — May 2026", size: 22, color: COLORS.grayText, font: "Georgia" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "© 2026 Shailja Dubey. All Rights Reserved.", size: 20, color: COLORS.grayText, font: "Arial" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "CONFIDENTIAL", size: 20, bold: true, color: COLORS.red, font: "Arial" })],
  }));

  // Page break after cover
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── TABLE OF CONTENTS ──────────────────────────────────
  children.push(heading1("Table of Contents"));
  children.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 1: PROJECT OVERVIEW
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("1. Project Overview"));

  children.push(heading2("1.1 What is Sakhi?"));
  children.push(para("Sakhi is an Ayurvedic menstrual cycle tracker that combines ancient Indian wellness wisdom with modern cycle tracking. The name “Sakhi” means “friend” or “companion” in Sanskrit — a trusted companion who walks alongside women through every phase of their cycle."));
  children.push(para("Unlike conventional period trackers, Sakhi maps each menstrual phase to its corresponding Ayurvedic dosha, providing personalized diet plans, yoga sequences, pranayama (breathing exercises), herbal recommendations, and daily rituals rooted in classical Ayurvedic texts like Charaka Samhita and Sushruta Samhita."));

  children.push(heading2("1.2 Vision & Philosophy"));
  children.push(para("Let the product speak. No hype, no pitch decks, no investor meetings. Build something genuinely useful, put it where people can find it, and let word of mouth do what no ad campaign can.", { italic: true }));
  children.push(para("Ayurveda itself spread across the world not through marketing — but because it worked. Sakhi should grow the same way."));

  children.push(heading2("1.3 Unique Value Proposition"));
  children.push(makeTable(
    ["Feature", "Description"],
    [
      ["Dosha-Mapped Phases", "Each cycle phase mapped to Vata, Kapha, or Pitta dosha with targeted recommendations"],
      ["Sanskrit Shlokas", "Authentic verses from Charaka Samhita, Sushruta Samhita with transliterations and meanings"],
      ["Ayurvedic Diet Plans", "Full meal plans (morning, lunch, evening, snacks) for each phase with Indian recipes"],
      ["Yoga & Pranayama", "Phase-specific yoga sequences with Sanskrit names, benefits, and step-by-step instructions"],
      ["Herbal Guidance", "Classical herb recommendations (Shatavari, Ashoka, Dashmool) with dosage notes"],
      ["Daily Rituals", "Ritucharya-based lifestyle practices for each phase"],
      ["Zero Data Collection", "All data stored locally on device — no servers, no tracking, no analytics"],
      ["100% Free", "Complete cycle tracking with all features free forever"],
    ],
    [3000, 6360]
  ));

  children.push(heading2("1.4 Target Audience"));
  children.push(para("Women aged 18–45 who are interested in:"));
  children.push(para("•  Natural and Ayurvedic approaches to menstrual health", { font: "Arial" }));
  children.push(para("•  Understanding their cycle phases and hormonal changes", { font: "Arial" }));
  children.push(para("•  Yoga and pranayama for cycle-related discomfort", { font: "Arial" }));
  children.push(para("•  Indian dietary wisdom for hormonal balance", { font: "Arial" }));
  children.push(para("•  Privacy-first health tracking (no cloud, no accounts)", { font: "Arial" }));

  children.push(heading2("1.5 Current Status"));
  children.push(makeTable(
    ["Item", "Status", "Details"],
    [
      ["PWA (Web App)", "✅ Live", "Deployed at https://www-nine-gilt.vercel.app"],
      ["Android Build", "✅ Ready", "Capacitor-wrapped, pending Play Store submission"],
      ["iOS Build", "✅ Ready", "Capacitor-wrapped, requires Xcode for final build"],
      ["Privacy Policy", "✅ Complete", "GDPR-aware, local-only data storage"],
      ["Terms of Service", "✅ Complete", "Full IP protection, Indian law governing"],
      ["Business Plan", "✅ Complete", "WFH quiet-growth model"],
      ["Premium Features", "⏳ Planned", "Dosha quiz, meal plans, herb journal"],
      ["Community/Blog", "⏳ Planned", "3-layer architecture designed"],
    ],
    [2800, 1800, 4760]
  ));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: TECHNICAL ARCHITECTURE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("2. Technical Architecture"));

  children.push(heading2("2.1 Architecture Overview"));
  children.push(para("Sakhi is a client-side Progressive Web App (PWA) with no backend. All logic runs in the browser. Data persists in localStorage. The app is wrapped with Capacitor for native iOS/Android distribution."));

  children.push(heading3("Architecture Diagram", COLORS.purple));
  children.push(codeBlock("  ┌──────────────────────────────────────┐"));
  children.push(codeBlock("  │  USER’S DEVICE (Browser/App)      │"));
  children.push(codeBlock("  │  ┌──────────────────────────────────┐  │"));
  children.push(codeBlock("  │  │  index.html (Single File App) │  │"));
  children.push(codeBlock("  │  │  ─ HTML structure              │  │"));
  children.push(codeBlock("  │  │  ─ CSS styles (embedded)       │  │"));
  children.push(codeBlock("  │  │  ─ JavaScript logic            │  │"));
  children.push(codeBlock("  │  │  ─ PHASES data (Ayurvedic)     │  │"));
  children.push(codeBlock("  │  └──────────────────────────────────┘  │"));
  children.push(codeBlock("  │       ↓            ↓            ↓    │"));
  children.push(codeBlock("  │  localStorage   sw.js     manifest  │"));
  children.push(codeBlock("  │  (user data)    (cache)   (PWA)     │"));
  children.push(codeBlock("  └──────────────────────────────────────┘"));
  children.push(spacer());
  children.push(codeBlock("  ┌─────────────────┐   ┌────────────────┐"));
  children.push(codeBlock("  │ Capacitor (iOS) │   │ Capacitor (And)│"));
  children.push(codeBlock("  │ WebView wrapper │   │ WebView wrapper│"));
  children.push(codeBlock("  └─────────────────┘   └────────────────┘"));
  children.push(spacer());
  children.push(codeBlock("  Vercel (Static Hosting) ── serves www/ folder"));

  children.push(heading2("2.2 Technology Stack"));
  children.push(makeTable(
    ["Layer", "Technology", "Purpose"],
    [
      ["Frontend", "HTML5, CSS3, Vanilla JavaScript", "Single-file app, no frameworks"],
      ["Styling", "CSS Custom Properties (Variables)", "Soothing color palette, responsive design"],
      ["Data Storage", "localStorage", "All user data stored locally on device"],
      ["PWA", "Service Worker + manifest.json", "Offline capability, install prompt"],
      ["Native Wrapper", "Capacitor 8.x", "iOS and Android builds via WebView"],
      ["Build Tool", "html-minifier-terser", "Production minification with JS mangling"],
      ["Icon Generation", "Node.js canvas", "Programmatic PNG icon generation (9 sizes)"],
      ["Splash Screens", "Node.js canvas", "Programmatic splash screen generation (7 sizes)"],
      ["Hosting", "Vercel", "Free static site hosting with global CDN"],
      ["Version Control", "Git", "Source code management"],
    ],
    [2000, 3200, 4160]
  ));

  children.push(heading2("2.3 File Structure"));
  children.push(codeBlock("sakhi-cycle-tracker/"));
  children.push(codeBlock("├── index.html              # Main app (HTML + CSS + JS, ~700 lines)"));
  children.push(codeBlock("├── privacy.html            # Privacy policy page"));
  children.push(codeBlock("├── terms.html              # Terms of service page"));
  children.push(codeBlock("├── splash.html             # Launch splash screen"));
  children.push(codeBlock("├── sw.js                   # Service worker (cache-first)"));
  children.push(codeBlock("├── manifest.json           # PWA manifest"));
  children.push(codeBlock("├── capacitor.config.json   # Capacitor native config"));
  children.push(codeBlock("├── package.json            # NPM dependencies & scripts"));
  children.push(codeBlock("├── build-prod.js           # Production build script"));
  children.push(codeBlock("├── generate-icons.js       # Icon generation (canvas)"));
  children.push(codeBlock("├── generate-splash.js      # Splash screen generation"));
  children.push(codeBlock("├── LICENSE                 # Proprietary license"));
  children.push(codeBlock("├── BUSINESS_PLAN.md        # Growth strategy document"));
  children.push(codeBlock("├── STORE_LISTING.md        # App store metadata"));
  children.push(codeBlock("├── icons/                  # App icons (72px–1024px PNG)"));
  children.push(codeBlock("├── resources/              # Splash screen PNGs"));
  children.push(codeBlock("├── www/                    # Production build output"));
  children.push(codeBlock("├── ios/                    # Capacitor iOS project"));
  children.push(codeBlock("└── android/                # Capacitor Android project"));

  children.push(heading2("2.4 Data Model", COLORS.purple));
  children.push(para("All data is stored in the browser’s localStorage as JSON. No accounts, no cloud sync, no backend."));
  children.push(heading3("localStorage Keys"));
  children.push(makeTable(
    ["Key", "Type", "Description"],
    [
      ["sakhi_period_start", "ISO Date String", "User’s last period start date"],
      ["sakhi_cycle_length", "Number", "Average cycle length (default: 28)"],
      ["sakhi_period_duration", "Number", "Period duration in days (default: 5)"],
      ["sakhi_checkins", "JSON Object", "Daily mood and symptom check-ins keyed by date"],
    ],
    [2800, 2000, 4560]
  ));

  children.push(heading2("2.5 Dosha-Phase Mapping", COLORS.green));
  children.push(para("Sakhi’s core innovation is mapping each menstrual phase to its dominant Ayurvedic dosha:"));
  children.push(makeTable(
    ["Phase", "Dosha", "Color", "Days", "Ayurvedic Rationale"],
    [
      ["Menstrual", "Vata", "#C27C7E", "1–5", "Apana Vayu governs downward flow; Vata aggravation causes cramps, anxiety"],
      ["Follicular", "Kapha", "#6B9E80", "6–13", "Building phase; Kapha’s earth/water qualities support tissue growth"],
      ["Ovulation", "Pitta-Kapha", "#C9A067", "14–16", "Peak energy; Pitta’s fire drives transformation, Kapha sustains"],
      ["Luteal", "Pitta→Vata", "#8E7EB5", "17–28", "Pitta governs early luteal heat; late-phase Vata rise causes PMS"],
    ],
    [1600, 1400, 1200, 1000, 4160]
  ));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 3: DESIGN SPECIFICATIONS
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("3. Design Specifications"));

  children.push(heading2("3.1 Color Palette"));
  children.push(para("The palette is designed to be soothing, warm, and earthy — reflecting the natural, calming philosophy of Ayurveda."));

  children.push(heading3("Phase Colors"));
  children.push(colorDot("Menstrual — #C27C7E (Warm Rose)", COLORS.menstrual));
  children.push(colorDot("Follicular — #6B9E80 (Sage Green)", COLORS.follicular));
  children.push(colorDot("Ovulation — #C9A067 (Warm Gold)", COLORS.ovulation));
  children.push(colorDot("Luteal — #8E7EB5 (Soft Lavender)", COLORS.luteal));

  children.push(heading3("UI Colors"));
  children.push(colorDot("Dark — #3A3535 (Header, text)", COLORS.dark));
  children.push(colorDot("Cream — #F7F3EE (Background)", "E8DFD3"));
  children.push(colorDot("Gold — #C9A96E (Accents, logo)", COLORS.gold));
  children.push(colorDot("Muted — #8E8585 (Secondary text)", "8E8585"));
  children.push(colorDot("Border — #E0D8D0 (Dividers)", "E0D8D0"));

  children.push(heading2("3.2 Typography"));
  children.push(makeTable(
    ["Element", "Font", "Size", "Weight", "Usage"],
    [
      ["App Logo", "Georgia", "22px", "Normal", "SAKHI in gold (#C9A96E)"],
      ["Phase Headings", "Georgia", "22px", "Normal", "Phase name display"],
      ["Body Text", "Georgia", "14–15px", "Normal", "Descriptions, content"],
      ["Sanskrit Shlokas", "Georgia", "16px", "Normal", "Shloka text blocks"],
      ["UI Labels", "Sans-serif", "11–13px", "600", "Buttons, badges, meta"],
      ["Code/Data", "Courier New", "12px", "Normal", "Technical references"],
    ],
    [1800, 1600, 1400, 1200, 3360]
  ));

  children.push(heading2("3.3 UI Components"));
  children.push(heading3("Phase Hero Card"));
  children.push(para("The main dashboard element showing current phase with cycle wheel canvas, phase name, dosha badge, and description. Background color matches the current phase’s light variant."));

  children.push(heading3("Cycle Wheel (Canvas)"));
  children.push(para("Interactive HTML5 Canvas element drawing a circular chart with four colored arcs representing cycle phases. The current day is highlighted with a marker. Center displays the cycle day number."));

  children.push(heading3("Shloka Block"));
  children.push(para("Distinctive card with gold left border (#C9A96E), gradient background, displaying Sanskrit verse, transliteration, English meaning, and classical source reference."));

  children.push(heading3("Tab Navigation"));
  children.push(para("Content tabs for Shastra (sacred texts), Ayurveda (diet/herbs), Yoga (poses/pranayama), and All Phases overview. Active tab styled with dark background (#3A3535)."));

  children.push(heading2("3.4 Responsive Breakpoints"));
  children.push(makeTable(
    ["Breakpoint", "Layout Change"],
    [
      ["< 480px", "Single column layout, stacked cards"],
      ["480px+", "Tips grid switches to 2 columns"],
      ["520px+", "Phase hero switches to side-by-side (wheel + info)"],
      ["900px max-width", "Main content container cap"],
    ],
    [3000, 6360]
  ));

  children.push(heading2("3.5 PWA Configuration"));
  children.push(makeTable(
    ["Property", "Value"],
    [
      ["App Name", "Sakhi — Ayurvedic Cycle Tracker"],
      ["Short Name", "Sakhi"],
      ["Display Mode", "standalone"],
      ["Orientation", "portrait"],
      ["Theme Color", "#2C1A0E"],
      ["Background Color", "#FDF8F2"],
      ["Categories", "health, lifestyle, fitness"],
      ["Start URL", "/index.html"],
      ["Icon Sizes", "72, 96, 128, 144, 152, 192, 384, 512, 1024"],
    ],
    [3500, 5860]
  ));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 4: COMPLETE CODE BASE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("4. Complete Code Base"));
  children.push(para("This section contains a reference of every key file in the Sakhi project, with descriptions of their purpose and key code structures."));

  children.push(heading2("4.1 index.html — Main Application", COLORS.green));
  children.push(para("The entire application lives in a single HTML file (~700 lines). This is intentional — no build complexity, no module bundlers, no framework dependencies. The file contains:"));
  children.push(para("•  HTML structure: Header, main content area, tab navigation, modals", { font: "Arial" }));
  children.push(para("•  Embedded CSS: Full responsive stylesheet with CSS custom properties", { font: "Arial" }));
  children.push(para("•  Embedded JavaScript: All application logic including the PHASES data object", { font: "Arial" }));

  children.push(heading3("Key JavaScript Functions"));
  children.push(makeTable(
    ["Function", "Purpose"],
    [
      ["saveCycle()", "Saves period start date, cycle length, and period duration to localStorage"],
      ["renderPhaseHero()", "Renders the main dashboard with current phase info and cycle wheel"],
      ["drawWheel()", "Draws the HTML5 Canvas cycle wheel with colored arcs"],
      ["renderShastra()", "Displays Sanskrit shlokas with transliteration and meaning"],
      ["renderAyurveda()", "Shows diet plans, herbs, and rituals for current phase"],
      ["renderCalendar()", "Draws the monthly calendar with color-coded phase days"],
      ["renderStats()", "Shows cycle statistics (length, period duration, next period)"],
      ["renderPhasesOverview()", "Displays all four phases in a scrollable overview"],
      ["switchTab()", "Handles tab navigation between Shastra, Ayurveda, Yoga, All Phases"],
      ["toggleMood() / toggleSymptom()", "Handles daily check-in selections"],
      ["saveCheckin()", "Persists mood/symptom data to localStorage"],
      ["prevMonth() / nextMonth()", "Calendar month navigation"],
    ],
    [3500, 5860]
  ));

  children.push(heading3("PHASES Data Structure", COLORS.purple));
  children.push(para("The PHASES object is the heart of Sakhi’s content. Each phase contains:"));
  children.push(codeBlock("PHASES = {"));
  children.push(codeBlock("  menstrual: {"));
  children.push(codeBlock("    key, english, sanskrit, dosha, doshaIcon, color, lightColor,"));
  children.push(codeBlock("    moon, desc,"));
  children.push(codeBlock("    shlokas: [{ sanskrit, transliteration, meaning, source }],"));
  children.push(codeBlock("    science: \"...\","));
  children.push(codeBlock("    mealPlan: { morning, lunch, evening, snacks, avoid },"));
  children.push(codeBlock("    yogaPoses: [{ name, sanName, benefit, instruction }],"));
  children.push(codeBlock("    pranayama: [{ name, benefit }],"));
  children.push(codeBlock("    herbs: [{ name, use }],"));
  children.push(codeBlock("    ritual: [\"...\"]"));
  children.push(codeBlock("  },"));
  children.push(codeBlock("  follicular: { ... },"));
  children.push(codeBlock("  ovulation: { ... },"));
  children.push(codeBlock("  luteal: { ... }"));
  children.push(codeBlock("}"));

  children.push(heading2("4.2 sw.js — Service Worker", COLORS.green));
  children.push(para("Cache-first service worker that enables offline functionality:"));
  children.push(codeBlock("Cache Name: 'sakhi-v2'"));
  children.push(codeBlock("Cached Assets: /, /index.html, /manifest.json, /privacy.html,"));
  children.push(codeBlock("              /terms.html, /icons/icon-192.png, /icons/icon-512.png"));
  children.push(codeBlock("Strategy: Cache-first (serve from cache, fallback to network)"));
  children.push(codeBlock("Lifecycle: skipWaiting() on install, clients.claim() on activate"));
  children.push(codeBlock("Cleanup: Deletes old cache versions on activate"));

  children.push(heading2("4.3 build-prod.js — Production Build", COLORS.green));
  children.push(para("Minifies all HTML files using html-minifier-terser with aggressive settings:"));
  children.push(para("•  JavaScript mangling: Variable names shortened, console.log dropped", { font: "Arial" }));
  children.push(para("•  Reserved functions: saveCycle, clearAll, toggleMood, toggleSymptom, etc.", { font: "Arial" }));
  children.push(para("•  CSS minification: Whitespace removal, property shortening", { font: "Arial" }));
  children.push(para("•  Copyright header: Prepended to sw.js output", { font: "Arial" }));
  children.push(para("•  Output: All files written to www/ directory", { font: "Arial" }));

  children.push(heading2("4.4 capacitor.config.json — Native Config", COLORS.green));
  children.push(makeTable(
    ["Property", "Value"],
    [
      ["App ID", "com.sakhi.cycletracker"],
      ["App Name", "Sakhi"],
      ["Web Directory", "www"],
      ["Android Scheme", "https"],
      ["Background Color", "#FDF8F2"],
      ["Splash Duration", "2000ms"],
      ["Splash Background", "#2C1A0E"],
      ["Status Bar Style", "DARK"],
    ],
    [3500, 5860]
  ));

  children.push(heading2("4.5 manifest.json — PWA Manifest", COLORS.green));
  children.push(para("Defines the PWA behavior: standalone display mode, portrait orientation, 9 icon sizes from 72px to 1024px, theme color #2C1A0E, categories: health, lifestyle, fitness."));

  children.push(heading2("4.6 generate-icons.js — Icon Generator", COLORS.green));
  children.push(para("Uses Node.js canvas package to programmatically generate app icons in 9 sizes (72–1024px). Each icon features:"));
  children.push(para("•  Dark background (#2C1A0E)", { font: "Arial" }));
  children.push(para("•  Lotus petal design in phase colors", { font: "Arial" }));
  children.push(para("•  Colored cycle ring arcs", { font: "Arial" }));
  children.push(para("•  “SAKHI” text with gold gradient", { font: "Arial" }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 5: AYURVEDIC CONTENT REFERENCE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("5. Ayurvedic Content Reference"));
  children.push(para("This section documents all Ayurvedic content embedded in the Sakhi app, organized by cycle phase."));

  // --- Menstrual Phase ---
  children.push(heading2("5.1 Menstrual Phase — Rajasrava Kala", COLORS.menstrual));
  children.push(richPara([
    { text: "Dominant Dosha: ", bold: true },
    { text: "Vata (Apana Vayu)" },
  ]));
  children.push(richPara([
    { text: "Description: ", bold: true },
    { text: "Your body is shedding and renewing. Vata governs this downward flow. Ayurveda honours this as a time of rest, warmth, and inward reflection — like the new moon, a pause before renewal." },
  ]));

  children.push(heading3("Shlokas"));
  children.push(richPara([
    { text: "Source: ", bold: true, size: 20, color: COLORS.gold },
    { text: "Charaka Samhita, Sharira Sthana 8/5", size: 20, color: COLORS.gold },
  ]));
  children.push(para("“During menstruation, a woman should rest on a simple bed, eat light sattvic food from leaf plates, avoid daytime sleep, and refrain from exertion. She should be treated with tenderness and care.”", { italic: true }));

  children.push(heading3("Diet Plan"));
  children.push(makeTable(
    ["Meal", "Recommendation"],
    [
      ["Morning", "Warm water with ginger & lemon. Moong dal chilla with turmeric and cumin, or warm porridge with soaked dates"],
      ["Lunch", "Khichdi with ghee and steamed beetroot. Or warm roti with lauki sabzi and dal. Small piece of jaggery for iron"],
      ["Evening", "Golden milk — warm turmeric-ginger milk with cinnamon. Soaked almonds and walnuts"],
      ["Snacks", "Til-gur ladoo (sesame-jaggery balls), banana with cardamom, warm soup"],
      ["Avoid", "Cold drinks, ice cream, raw salads, excessive caffeine, deep-fried foods, very spicy food"],
    ],
    [2000, 7360]
  ));

  children.push(heading3("Yoga Poses"));
  children.push(makeTable(
    ["Pose", "Sanskrit", "Benefit"],
    [
      ["Reclined Butterfly", "Supta Baddha Konasana", "Relieves cramps & opens pelvic area"],
      ["Child’s Pose", "Balasana", "Eases lower back pain & calms mind"],
      ["Legs Up the Wall", "Viparita Karani", "Reduces bloating, fatigue & leg heaviness"],
      ["Supine Spinal Twist", "Supta Matsyendrasana", "Relieves lower back pain & aids digestion"],
    ],
    [2500, 3000, 3860]
  ));

  children.push(heading3("Herbs"));
  children.push(makeTable(
    ["Herb", "Usage"],
    [
      ["Shatavari", "Premier uterine tonic. Replenishes fluids, supports hormonal balance. 1/2 tsp with warm milk"],
      ["Ashoka Bark", "Classical remedy for heavy/painful periods. Artava-sthapana (menstrual regulator)"],
      ["Dashmool (Ten Roots)", "Powerful Vata-pacifying formula. Reduces pelvic pain, back ache, fatigue"],
      ["Fresh Ginger", "Anti-inflammatory, as effective as ibuprofen for cramps. Boil 1-inch piece, sip warm"],
    ],
    [2500, 6860]
  ));

  // --- Follicular Phase ---
  children.push(heading2("5.2 Follicular Phase — Ritu Kala", COLORS.follicular));
  children.push(richPara([
    { text: "Dominant Dosha: ", bold: true },
    { text: "Kapha" },
  ]));
  children.push(richPara([
    { text: "Description: ", bold: true },
    { text: "Energy rises like spring after rain. Kapha brings stability, creativity, and renewal. Estrogen climbs, follicles mature. A time to plant seeds — of intention, projects, and new beginnings." },
  ]));
  children.push(richPara([
    { text: "Source: ", bold: true, size: 20, color: COLORS.gold },
    { text: "Sushruta Samhita, Sharira Sthana 2/17", size: 20, color: COLORS.gold },
  ]));
  children.push(para("“Pure, healthy menstrual blood is free from foul smell and resembles the colour of a red lotus flower or lac dye.”", { italic: true }));

  // --- Ovulation Phase ---
  children.push(heading2("5.3 Ovulation Phase — Rutumati Kala", COLORS.ovulation));
  children.push(richPara([
    { text: "Dominant Dosha: ", bold: true },
    { text: "Pitta-Kapha" },
  ]));
  children.push(richPara([
    { text: "Description: ", bold: true },
    { text: "Peak energy — fire and radiance. You are at your most magnetic and communicative. Pitta’s fire governs transformation while Kapha sustains the egg’s release." },
  ]));

  // --- Luteal Phase ---
  children.push(heading2("5.4 Luteal Phase — Rajah Purva Kala", COLORS.luteal));
  children.push(richPara([
    { text: "Dominant Dosha: ", bold: true },
    { text: "Pitta → Vata (transitional)" },
  ]));
  children.push(richPara([
    { text: "Description: ", bold: true },
    { text: "The winding-down phase. Progesterone rises then falls. Early luteal is Pitta-dominant (heat, intensity), late luteal shifts to Vata (anxiety, restlessness, PMS symptoms)." },
  ]));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 6: CONTENT STRATEGY
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("6. Content Strategy"));

  children.push(heading2("6.1 SEO Blog Content Plan"));
  children.push(para("Write 1 article per week from home. Target low-competition, high-intent keywords that women actually search for:"));
  children.push(makeTable(
    ["Week", "Article Topic", "Target Keyword"],
    [
      ["1", "Complete Guide to Ayurvedic Diet During Periods", "ayurvedic diet during periods"],
      ["2", "Best Yoga Poses for Menstrual Cramps", "yoga poses for menstrual cramps"],
      ["3", "What to Eat During Luteal Phase (Ayurveda)", "what to eat during luteal phase ayurveda"],
      ["4", "Shatavari Benefits for Periods", "shatavari benefits for periods"],
      ["5", "Ayurvedic Remedies for PMS", "ayurvedic remedies for PMS"],
      ["6", "What is Vata Dosha Menstruation", "vata dosha menstruation"],
      ["7", "Pranayama for Period Pain Relief", "pranayama for period pain"],
      ["8", "Ayurvedic Golden Milk Recipe for Hormones", "golden milk hormonal balance"],
      ["9", "Understanding Your Dosha and Your Cycle", "dosha menstrual cycle"],
      ["10", "Ashoka Bark Benefits for Women", "ashoka bark benefits women"],
      ["11", "Seasonal Eating for Hormonal Health (Ritucharya)", "ritucharya hormonal health"],
      ["12", "Ayurvedic Self-Care Rituals for Each Cycle Phase", "ayurvedic self-care menstrual cycle"],
    ],
    [800, 5000, 3560]
  ));

  children.push(heading2("6.2 Publishing Channels"));
  children.push(para("•  Blog on Vercel site (free) — simple HTML pages matching app design", { font: "Arial" }));
  children.push(para("•  Medium (built-in audience, free) — cross-post articles", { font: "Arial" }));
  children.push(para('•  Substack newsletter "Sakhi Letters" — weekly Ayurvedic cycle wisdom', { font: "Arial" }));

  children.push(heading2("6.3 Community Engagement"));
  children.push(makeTable(
    ["Platform", "Activity", "Frequency"],
    [
      ["Reddit (r/Ayurveda, r/yoga, r/menstruation)", "Answer questions genuinely. Mention Sakhi only when relevant", "2–3x/week"],
      ["Yoga/Ayurveda Facebook groups", "Share useful tips from app content", "1–2x/week"],
      ["Quora (period/Ayurveda questions)", "Write thoughtful answers, link to blog", "1x/week"],
    ],
    [3200, 4360, 1800]
  ));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 7: IMPLEMENTATION ROADMAP
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("7. Implementation Roadmap"));

  children.push(heading2("7.1 Growth Timeline"));
  children.push(makeTable(
    ["Month", "Milestone", "Expected Users", "Revenue"],
    [
      ["1–3", "Write 12 blog articles. Share PWA link. Collect feedback", "200–500", "—"],
      ["4–6", "Launch on Google Play. Start Substack newsletter", "1,000–2,000", "—"],
      ["7–9", "Launch Premium tier (Sakhi Sattvic)", "2,000–3,000", "€120–200/mo"],
      ["10–12", "Blog articles rank on Google. Organic growth compounds", "3,000–5,000", "€400–800/mo"],
      ["13–18", "Word of mouth. Sustainable side income", "5,000–10,000", "€800–1,500/mo"],
      ["18–24", "Growth accelerates without pushing harder", "15,000–30,000", "€2,000–4,000/mo"],
    ],
    [1200, 4160, 1800, 2200]
  ));

  children.push(heading2("7.2 Premium Features (Sakhi Sattvic)"));
  children.push(richPara([
    { text: "Pricing: ", bold: true },
    { text: "€3.99/month or €29.99/year" },
  ]));
  children.push(makeTable(
    ["Feature", "Description"],
    [
      ["Prakriti (Dosha) Quiz", "Personalized recommendations based on Vata/Pitta/Kapha constitution"],
      ["Weekly Meal Plans", "7-day Ayurvedic meal plans rotating with cycle phase and season, with grocery lists"],
      ["Guided Yoga Sequences", "Illustrated step-by-step flows with timers (e.g., “10-min cramp relief flow”)"],
      ["Herb Journal", "Track herbs taken, effects over cycles. Builds personal evidence"],
      ["Cycle History & Patterns", "Multi-month analytics: symptom correlations, seasonal patterns"],
      ["Seasonal (Ritucharya) Guides", "Diet/lifestyle guidance changing with seasons. Quarterly content drops"],
      ["Audio Shloka Pronunciation", "Hear Sanskrit verses pronounced correctly, with meaning"],
    ],
    [3000, 6360]
  ));

  children.push(heading2("7.3 Community Features (3-Layer Architecture)"));
  children.push(heading3("Layer 1: Blog (Static HTML)", COLORS.green));
  children.push(para("Simple HTML pages on Vercel, matching app design. Zero cost, SEO-friendly. Articles on Ayurvedic menstrual health."));

  children.push(heading3("Layer 2: Comments (Giscus/Disqus)", COLORS.orange));
  children.push(para("Add discussion under blog posts using Giscus (GitHub Discussions-backed) or Disqus. No backend required."));

  children.push(heading3("Layer 3: Community Circles (Supabase)", COLORS.purple));
  children.push(para("Full community with user profiles, topic-based circles, and moderation. Uses Supabase for auth and database. Implemented only when user base justifies it."));

  children.push(heading2("7.4 Technical Next Steps"));
  children.push(para("1. Add blog section to the Vercel site (simple HTML pages, same design)", { font: "Arial" }));
  children.push(para("2. Build the “Share your phase” card feature (shareable Instagram story image)", { font: "Arial" }));
  children.push(para("3. Build the Prakriti dosha quiz (premium feature #1)", { font: "Arial" }));
  children.push(para("4. Set up Stripe or Paddle for payments (both work well from Germany)", { font: "Arial" }));
  children.push(para("5. Add a “What’s new” section in the app for content drops", { font: "Arial" }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 8: DEPLOYMENT GUIDE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("8. Deployment Guide"));

  children.push(heading2("8.1 Local Development"));
  children.push(codeBlock("# Clone / navigate to project"));
  children.push(codeBlock("cd sakhi-cycle-tracker"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Install dependencies"));
  children.push(codeBlock("npm install"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Open in browser (no build step needed for dev)"));
  children.push(codeBlock("open index.html"));
  children.push(codeBlock("# Or use any local server:"));
  children.push(codeBlock("npx serve ."));

  children.push(heading2("8.2 Production Build"));
  children.push(codeBlock("# Build minified output to www/"));
  children.push(codeBlock("npm run build"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Output:"));
  children.push(codeBlock("# www/index.html    (minified HTML + CSS + JS)"));
  children.push(codeBlock("# www/privacy.html  (minified)"));
  children.push(codeBlock("# www/terms.html    (minified)"));
  children.push(codeBlock("# www/splash.html   (minified)"));
  children.push(codeBlock("# www/sw.js         (with copyright header)"));
  children.push(codeBlock("# www/manifest.json (copied)"));
  children.push(codeBlock("# www/icons/        (copied)"));

  children.push(heading2("8.3 Vercel Deployment"));
  children.push(codeBlock("# Deploy to Vercel (from project root)"));
  children.push(codeBlock("npm run build"));
  children.push(codeBlock("npx vercel www --prod --yes"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Current production URL:"));
  children.push(codeBlock("# https://www-nine-gilt.vercel.app"));

  children.push(heading2("8.4 Android Build"));
  children.push(codeBlock("# Sync web assets to Android project"));
  children.push(codeBlock("npm run sync"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Open in Android Studio"));
  children.push(codeBlock("npm run open:android"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Build APK/AAB from Android Studio"));
  children.push(codeBlock("# Build > Generate Signed Bundle / APK"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Google Play Developer Account: €25 one-time"));

  children.push(heading2("8.5 iOS Build"));
  children.push(codeBlock("# Sync web assets to iOS project"));
  children.push(codeBlock("npm run sync"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Open in Xcode"));
  children.push(codeBlock("npm run open:ios"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Requires: Mac with Xcode installed"));
  children.push(codeBlock("# Apple Developer Account: $99/year"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Alternative: Cloud build service (Codemagic, Appflow)"));

  children.push(heading2("8.6 Icon & Splash Generation"));
  children.push(codeBlock("# Generate all app icons (9 sizes)"));
  children.push(codeBlock("npm run icons"));
  children.push(codeBlock(""));
  children.push(codeBlock("# Generate splash screens (7 sizes)"));
  children.push(codeBlock("npm run splash"));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 9: THIRD-PARTY INTEGRATIONS
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("9. Third-Party Integrations"));

  children.push(heading2("9.1 Current Integrations"));
  children.push(makeTable(
    ["Service", "Purpose", "Cost"],
    [
      ["Vercel", "Static hosting with global CDN, automatic HTTPS", "Free"],
      ["Capacitor 8.x", "Wrap PWA as native iOS/Android app", "Free (open source)"],
      ["html-minifier-terser", "Production build minification with JS obfuscation", "Free (open source)"],
      ["Node.js canvas", "Programmatic icon and splash screen generation", "Free (open source)"],
    ],
    [2800, 4560, 2000]
  ));

  children.push(heading2("9.2 Planned Integrations"));
  children.push(makeTable(
    ["Service", "Purpose", "When"],
    [
      ["Stripe or Paddle", "Payment processing for Premium subscriptions", "Month 7–9"],
      ["Giscus", "GitHub Discussions-backed comments for blog", "Month 4–6"],
      ["Supabase", "Auth and database for community features", "Month 10+"],
      ["Google Play Console", "Android app distribution", "Month 2–3"],
      ["Apple App Store Connect", "iOS app distribution", "Month 4–6"],
    ],
    [2800, 4560, 2000]
  ));

  children.push(heading2("9.3 Deliberately Not Used"));
  children.push(para("The following are intentionally excluded from Sakhi:"));
  children.push(para("•  Google Analytics / any analytics — no tracking of users", { font: "Arial" }));
  children.push(para("•  Firebase / any cloud database — all data stays on device", { font: "Arial" }));
  children.push(para("•  Ad networks — no advertisements ever", { font: "Arial" }));
  children.push(para("•  Social login (Google/Facebook) — no accounts required", { font: "Arial" }));
  children.push(para("•  Apple Health / Google Fit — no external health platform integration", { font: "Arial" }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 10: LEGAL & IP PROTECTION
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("10. Legal & IP Protection"));

  children.push(heading2("10.1 Copyright"));
  children.push(richPara([
    { text: "© 2026 Shailja Dubey. All Rights Reserved.", bold: true, size: 24 },
  ]));
  children.push(para("All code, content, design, and Ayurvedic compilations in Sakhi are the intellectual property of Shailja Dubey. Protected under the Indian Copyright Act, 1957 and international copyright treaties (Berne Convention)."));

  children.push(heading2("10.2 License"));
  children.push(para("Sakhi uses a proprietary license that prohibits:"));
  children.push(para("•  Copying, modification, or distribution of source code", { font: "Arial" }));
  children.push(para("•  Commercial use or sublicensing", { font: "Arial" }));
  children.push(para("•  Reverse engineering or decompilation", { font: "Arial" }));
  children.push(para("•  Creating derivative works", { font: "Arial" }));

  children.push(heading2("10.3 Privacy Policy"));
  children.push(para("Sakhi collects zero data remotely. All menstrual cycle data, moods, and symptoms are stored exclusively in the user’s browser localStorage. No data is ever transmitted to any server. No analytics, no cookies, no tracking pixels."));

  children.push(heading2("10.4 Governing Law"));
  children.push(para("All legal matters are governed by the laws of India, with jurisdiction in Indian courts. The Terms of Service reference both the Indian Copyright Act 1957 and the Information Technology Act 2000."));

  children.push(heading2("10.5 Costs Summary"));
  children.push(makeTable(
    ["Item", "Cost", "When"],
    [
      ["Vercel hosting", "Free", "Now"],
      ["Domain (sakhi-app.com)", "€12/year", "Month 1"],
      ["Google Play developer account", "€25 one-time", "Month 2–3"],
      ["Trademark “SAKHI” (India)", "~€50", "Month 3–4"],
      ["Substack / Medium", "Free", "Month 1"],
      ["Total Year 1", "~€90", "—"],
    ],
    [3500, 2000, 3860]
  ));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 11: MONTHLY ROUTINE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("11. Monthly Work Routine (WFH)"));
  children.push(para("All of this fits into 10–15 hours/week alongside other work."));

  children.push(makeTable(
    ["Day", "Task", "Time"],
    [
      ["Monday", "Write 1 blog article / newsletter", "2 hrs"],
      ["Wednesday", "Improve the app — one small feature or content addition", "2–3 hrs"],
      ["Thursday", "Engage in 2–3 online communities (Reddit, Quora, groups)", "1 hr"],
      ["Saturday", "Review analytics, respond to user feedback, plan next week", "1 hr"],
    ],
    [1800, 5560, 2000]
  ));

  children.push(spacer());
  children.push(para("No daily content grind. No stories every 6 hours. Consistency is writing one good article per week for a year, not posting 3 reels a day for a month.", { italic: true }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // SECTION 12: WHAT SUCCESS LOOKS LIKE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("12. What Success Looks Like"));
  children.push(para("Not a TechCrunch headline. Not a Series A.", { italic: true }));
  children.push(spacer());
  children.push(para("•  10,000 women using Sakhi to understand their bodies better", { font: "Arial" }));
  children.push(para("•  A steady €2,000–4,000/month flowing in while working from home in Berlin", { font: "Arial" }));
  children.push(para('•  An inbox with messages like "I finally understand why I feel this way during my luteal phase"', { font: "Arial" }));
  children.push(para("•  An app that reflects genuine knowledge, not growth hacking", { font: "Arial" }));
  children.push(para("•  Full ownership, no investors, no board meetings, no pressure", { font: "Arial" }));
  children.push(spacer());
  children.push(para("The best businesses are the ones that don’t feel like businesses. They feel like something you’d do anyway — and people happen to value it enough to pay.", { italic: true }));

  children.push(divider());
  children.push(spacer());
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "End of Document", size: 20, color: COLORS.grayText, font: "Arial", italics: true })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "© 2026 Shailja Dubey. All Rights Reserved.", size: 18, color: COLORS.grayText, font: "Arial" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CONFIDENTIAL — Not for public distribution", size: 18, color: COLORS.red, font: "Arial", bold: true })],
  }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════════════════
  // APPENDIX A: COMPLETE SOURCE CODE
  // ═══════════════════════════════════════════════════════════
  children.push(heading1("Appendix A: Complete Source Code"));
  children.push(para("This appendix contains the complete, unmodified source code for every file in the Sakhi project. A developer can use these files to rebuild the entire application from scratch."));
  children.push(spacer());

  const sourceFiles = [
    { path: 'index.html', label: 'A.1 index.html — Main Application (HTML + CSS + JS)', desc: 'The complete single-file application containing all HTML structure, CSS styles, JavaScript logic, and the PHASES Ayurvedic data object.' },
    { path: 'sw.js', label: 'A.2 sw.js — Service Worker', desc: 'Cache-first service worker enabling offline PWA functionality.' },
    { path: 'manifest.json', label: 'A.3 manifest.json — PWA Manifest', desc: 'Progressive Web App configuration: name, icons, display mode, colors.' },
    { path: 'capacitor.config.json', label: 'A.4 capacitor.config.json — Native App Config', desc: 'Capacitor configuration for iOS and Android builds.' },
    { path: 'package.json', label: 'A.5 package.json — NPM Configuration', desc: 'Dependencies, scripts, and project metadata.' },
    { path: 'build-prod.js', label: 'A.6 build-prod.js — Production Build Script', desc: 'Minifies HTML/CSS/JS with terser, mangles variables, drops console.log, outputs to www/.' },
    { path: 'generate-icons.js', label: 'A.7 generate-icons.js — Icon Generator', desc: 'Programmatically generates 9 icon sizes (72px–1024px) using Node.js canvas with lotus design.' },
    { path: 'generate-splash.js', label: 'A.8 generate-splash.js — Splash Screen Generator', desc: 'Generates 7 splash screen sizes for iOS and Android using Node.js canvas.' },
    { path: 'privacy.html', label: 'A.9 privacy.html — Privacy Policy', desc: 'Full privacy policy documenting zero-data-collection approach.' },
    { path: 'terms.html', label: 'A.10 terms.html — Terms of Service', desc: 'Terms of Service with IP protection, health disclaimer, and Indian law jurisdiction.' },
    { path: 'LICENSE', label: 'A.11 LICENSE — Proprietary License', desc: 'Proprietary software license prohibiting copying, modification, and distribution.' },
  ];

  for (const file of sourceFiles) {
    let content;
    try {
      content = fs.readFileSync(file.path, 'utf8');
    } catch (e) {
      content = `[File not found: ${file.path}]`;
    }

    children.push(heading2(file.label, COLORS.green));
    children.push(para(file.desc, { italic: true, color: COLORS.grayText }));
    children.push(richPara([
      { text: "Lines: ", bold: true, size: 20, font: "Arial" },
      { text: `${content.split('\n').length}`, size: 20, font: "Arial" },
      { text: "  |  Characters: ", bold: true, size: 20, font: "Arial" },
      { text: `${content.length.toLocaleString()}`, size: 20, font: "Arial" },
    ]));
    children.push(spacer());

    // Split into lines and render as code blocks
    const lines = content.split('\n');
    // Group lines into chunks to avoid excessive paragraph count
    const CHUNK = 50;
    for (let i = 0; i < lines.length; i += CHUNK) {
      const chunk = lines.slice(i, i + CHUNK);
      const numbered = chunk.map((line, j) => {
        const lineNum = String(i + j + 1).padStart(4, ' ');
        return `${lineNum} │ ${line}`;
      }).join('\n');

      children.push(new Paragraph({
        spacing: { before: 0, after: 0 },
        shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
        children: [new TextRun({
          text: numbered,
          size: 14,
          font: "Courier New",
          color: COLORS.dark,
        })],
      }));
    }

    children.push(spacer());
    children.push(divider());
  }

  // ─── ASSEMBLE DOCUMENT ──────────────────────────────────
  const doc = new Document({
    creator: "Shailja Dubey",
    title: "Sakhi — Complete Project Documentation",
    description: "Comprehensive documentation for the Sakhi Ayurvedic Cycle Tracker application",
    styles: {
      default: {
        document: {
          run: { font: "Georgia", size: 22 },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Georgia", color: COLORS.blue },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Georgia", color: COLORS.dark },
          paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Georgia", color: COLORS.dark },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gold, space: 4 } },
            children: [
              new TextRun({ text: "SAKHI ", size: 18, bold: true, color: COLORS.gold, font: "Georgia" }),
              new TextRun({ text: "— Project Documentation", size: 18, color: COLORS.grayText, font: "Georgia", italics: true }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border, space: 4 } },
            children: [
              new TextRun({ text: "© 2026 Shailja Dubey  •  Page ", size: 16, color: COLORS.grayText, font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.grayText, font: "Arial" }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('/Users/shailjadubey/sakhi-cycle-tracker/Sakhi_App_Complete_Documentation.docx', buffer);
  console.log('Documentation generated: Sakhi_App_Complete_Documentation.docx');
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocs().catch(err => {
  console.error('Error generating docs:', err);
  process.exit(1);
});
