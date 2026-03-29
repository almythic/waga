# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WAGA Wellness is a multi-page luxury website for a premium five-day detox meal program launching in New York City. Built as plain HTML, CSS, and JavaScript with no frameworks.

**Client:** Nadja Radonjić (founder) and Aleksandra Balog "Sandra" (US partner)
**Target:** High-income NYC individuals (Upper East Side, Tribeca, SoHo)
**Positioning:** "This is not for everyone" — exclusive, quiet luxury

## Tech Stack

- **Plain HTML, CSS, JavaScript** — no frameworks, no build tools
- **Mobile-first** responsive design
- **Lenis** for smooth scrolling
- **Phosphor Icons** for iconography
- **Google Fonts:** Geist (sans-serif) + Instrument Serif (italic only)
- **Hosting:** GitHub Pages (subfolder approach)
- **Repository:** `https://github.com/almythic/waga.git`
- **Deployment:** Push to the `v2/` folder in the `main` branch of the repo above
- **Image generation:** Nano Banana — available for generating placeholder or section imagery when needed. Ask the user to generate via Nano Banana whenever a new image is required for a section or page.

## File Structure

```
/
├── index.html              # Home page (summary hub, built last)
├── about.html              # About page
├── program.html            # The Program page (includes food/menu content)
├── science.html            # Science page
├── testimonials.html       # Testimonials page
├── order.html              # Order page (onboarding-style flow)
├── css/
│   ├── global.css          # Global styles, resets, shared components
│   ├── home.css            # Home page styles
│   ├── about.css           # About page styles
│   ├── program.css         # Program page styles
│   ├── science.css         # Science page styles
│   ├── testimonials.css    # Testimonials page styles
│   └── order.css           # Order page styles
├── js/
│   ├── main.js             # Global scripts (nav, scroll, animations)
│   ├── hero.js             # Hero section animations
│   ├── program.js          # Program page interactions
│   ├── order.js            # Order page form flow
│   └── testimonials.js     # Testimonials interactions
├── components/
│   ├── header.html         # Header component (loaded dynamically)
│   └── footer.html         # Footer component (loaded dynamically)
├── tokens.css              # Design tokens v2.1 (CSS custom properties)
└── assets/
    ├── images/             # Images (hero, unboxing sequence)
    └── video/              # Video files
```

## Key Commands

Since this is a plain HTML/CSS/JS project, there are no build commands. To develop:

1. **Serve locally:** Use a local server (e.g., VS Code Live Server, `python -m http.server`, or `npx serve`)
2. **View in browser:** Open the local server URL

## Design System

### Typography (Dual Voice)

- **Geist** (Regular 400, Medium 500, Semibold 600, Bold 700): Structure, headings, body, UI
- **Instrument Serif** (italic only): Emotional phrases, taglines, testimonial quotes

### Color Palette

- Primary warm background: `--color-neutral-50` (#FDFBF5)
- Sand/cream surfaces: `--waga-cornsilk`, `--waga-meringue`
- Brand accent: `--waga-camel` (#B99470)
- CTA/buttons: `--waga-alloy` (#C4661F)
- Botanical (subtle): `--waga-olive` (#5F6F52), `--waga-laurel` (#A9B388)

### Important Rules

- **No Geist Light (300)** — use Regular (400) for display sizes
- **Instrument Serif only in italic** — never upright
- **No cool grays** — all neutrals have warm undertones
- **No pure #000 or #FFF** — use warm dark (#2E2518) and warm white (#FDFBF5)
- **60-30-10 ratio:** neutral backgrounds (60%) · sand surfaces (30%) · accents (10%)

### Components

All components are defined in `css/global.css`:
- Buttons (primary, secondary, tertiary, botanical)
- Badges/pills (accent-soft, warm, sand, botanical)
- Form inputs
- Section spacing (8pt grid)

## Development Notes

- Header and footer are loaded dynamically via `main.js` from `/components/`
- Lenis smooth scroll is initialized in `main.js` and exposed globally as `window.__lenis`
- Hero section uses scroll-driven video scaling in `hero.js`
- Order page uses onboarding-style dropdown/selection flow (not freeform text)
- Reduced motion is respected — animations disabled when `prefers-reduced-motion: reduce`

## Home Page Sections — Design Direction

### Science Preview Section — "The Cellular Atlas"

**Chosen Direction:** Option C — The Scroll-Driven Reveal

This section needed to show the science behind the detox program in an immersive, scroll-driven way. The original concept was:

- **Central visual:** An abstract organic form (SVG with connected nodes/lines) that morphs as you scroll
- **Four states** triggered by scroll position:
  1. Metabolism (camel color) — form pulses with warm amber glow
  2. Gut Microbiome (russet) — nodes multiply, branch outward
  3. Inflammation (olive) — form contracts, cooler tone
  4. Hormones (alloy) — full activation, golden illumination, outer ring appears
- **Info cards** on the right that fade in sequentially as each system "activates"
- **Progress counter** showing current stage (01/04)
- **Scroll behavior:** Tall scroll runway (600vh), sticky inner frame, cards and visual change as user scrolls

**Rejected alternatives:**
- Option A (The Living Network): Central glowing network that illuminates pathways sequentially — felt too "techy"
- Option B (The Elemental Circle): Four orbital circles arranged in a ring — too structured, less organic
- Idea 3 from earlier (The Protocol): Clean clinical data presentation — too simple/reserved for what the science section needed

**Implementation notes:**
- Uses `.home-science-scroll-section` as the scroll container (600vh tall)
- Visual uses SVG with nodes and connecting lines
- JavaScript tracks scroll progress and updates `data-state` on `.home-science-visual` plus toggles `.is-active` class on cards
- States 0-3 correspond to the four biological systems

## Further Reading

- Full design rules and project instructions: `.claude/rules/project-instructions.md`
