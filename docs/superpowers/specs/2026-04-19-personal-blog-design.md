# Personal Blog — Design Spec

**Date:** 2026-04-19
**Author:** Connor
**Status:** Approved

## Goal

Build a personal blog website for Connor, aesthetically inspired by [raealisa.com](https://raealisa.com/articles/my-north-star) (minimal, text-focused, calm), but with reader-friendlier navigation. The site publishes long-form prose articles with occasional images, hosted free on Vercel under Connor's own domain.

## Non-Goals

- Tags, categories, or taxonomy beyond chronological ordering
- Code syntax highlighting (articles will be prose + images, no code)
- Comments, reactions, or any interactive reader engagement
- Search (not needed at the expected post volume)
- CMS / editorial UI — articles are authored as MDX files in the repo
- Multi-author support

## Tech Stack

- **Framework:** Astro (static SSG)
- **Content:** MDX via Astro content collections with typed frontmatter
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free hobby tier, static deploy)
- **Source control:** GitHub (`github.com/connorwang/blog`, default branch `master`)
- **Analytics:** Vercel Web Analytics (built-in, privacy-friendly, no cookies)
- **Fonts:** Google Fonts — Newsreader (body) + Inter (UI/nav)

## Routes

| Route | Rendered content |
|---|---|
| `/` | The most recent non-draft article, rendered inline (same layout as `/articles/[slug]`) |
| `/articles` | Full article index, titles grouped by month (descending), each row shows title + publishing date |
| `/articles/[slug]` | A single article by slug |
| `/about` | About Me page (plain MDX content) |
| `/rss.xml` | RSS 2.0 feed of all non-draft articles, newest first |
| `/404` | 404 page (simple message + link home) |

## Content Model

### Folder layout

```
src/
  content/
    articles/
      2026-04-07-my-north-star.mdx
      2026-04-01-something-else.mdx
      _images/
        my-north-star-hero.jpg
  pages/
    about.mdx                   # standalone, not in a collection
```

- Article filenames use `YYYY-MM-DD-slug.mdx` for human-sortable filesystem listing.
- Images live in `src/content/articles/_images/` and are referenced from MDX via relative imports. Astro optimizes them at build time.
- The About page is a standalone MDX page at `src/pages/about.mdx` (not part of any content collection — there's only one of them).

### Article frontmatter (validated by content-collection schema)

```yaml
---
title: string              # required
date: YYYY-MM-DD           # required; drives sort and month grouping
slug: string               # optional; falls back to filename slug portion
description: string        # optional; used for <meta description> and RSS
draft: boolean             # optional; defaults to false
---
```

**Validation rules (enforced by the collection schema):**
- `title` and `date` are required; builds fail with a clear error if either is missing.
- `date` must parse as a valid ISO date.
- `slug`, if provided, must be lowercase-kebab-case.
- `draft: true` articles are rendered in `astro dev` (local) and excluded from `astro build` (production).

### About page

No frontmatter required — just MDX content. Rendered with the same visual shell as articles but without the article title block (no title, no date). Header of the page comes from the MDX itself.

## Layout & Visual Design

### Overall shell (all pages)

```
┌──────────────────────────────────────────────────────┐
│  Connor                             ☰   ☀/🌙        │  ← header
│                                                      │
│                                                      │
│                  ┌──────────────────┐                │
│                  │                  │                │
│                  │  article content │                │
│                  │  (centered in    │                │
│                  │   viewport,      │                │
│                  │   ~65ch / 680px) │                │
│                  │                  │                │
│                  └──────────────────┘                │
│                                                      │
│                  (footer, minimal)                   │
└──────────────────────────────────────────────────────┘
```

### Header

- `Connor` top-left, linked to `/`, uses Inter, font-weight 600, ~1.25rem on mobile / 1.5rem on desktop.
- Menu icon (`☰`) and theme toggle (sun/moon icon) on the top-right, side by side.
- Header container max-width `48rem` (768px), centered, 1rem horizontal padding. Vertical padding: 1rem on mobile, 2rem on desktop.
- No border beneath the header.

### Article-list panel (triggered by the menu icon)

- Slides in from the right when the menu icon is clicked. Same behavior on desktop and mobile (no breakpoint-specific logic).
- Dimmed overlay behind it; clicking the overlay or pressing `Esc` closes it.
- Panel contents, top to bottom:
  1. "All articles" link → `/articles`
  2. A list of every non-draft article, newest first, showing **title only** (no date — dates are on the index page)
  3. "About" link → `/about` at the bottom, visually separated by a small gap
- No background, no borders on list items; quiet hover underline (Inter, moderate weight).

### Article body

- Centered column: `max-width: 65ch`, sits inside the 48rem page container.
- **Title block:** article title (h1, Newsreader, font-weight ~700, 2.25em), then date below it in smaller muted text (e.g., "April 7, 2026").
- **Prose:** Newsreader, 1rem base, line-height 1.75, paragraph spacing 1.25em top/bottom.
- **Headings within article:** h2 (1.5em, 700), h3 (1.25em, italic, 600).
- **Links:** dashed underline, text-underline-offset 8px, accent color on hover.
- **Images:** span the full prose column, centered, with a 2em vertical margin. Optional italic caption below (smaller, muted).
- **Blockquote, lists, hr:** styled via `@tailwindcss/typography` (prose plugin) customized to match the colors below.

### Articles index page (`/articles`)

- Same shell, same centered column, Newsreader/Inter mixed.
- Articles grouped by month, descending (newest first):

    ```
    April 2026
      My North Star                     Apr 7, 2026
      Something else                    Apr 1, 2026

    March 2026
      An older piece                    Mar 22, 2026
    ```

- Month headers use Inter, small, muted, uppercase letter-spacing. Article titles use Newsreader, with dashed underline on hover. Dates are right-aligned in small muted text.

### Footer

- Minimal: a single line with © year + "Connor", centered, muted color. No social icons, no nav.

## Colors & Theming

Matching raealisa.com's palette, expressed as CSS custom properties so both themes share the same Tailwind utilities.

**Light mode (default if no system preference):**
- `--color-fill`: `rgb(251, 254, 251)` — near-white with a faint green cast
- `--color-text-base`: `rgb(40, 39, 40)` — near-black
- `--color-accent`: `rgb(0, 108, 172)` — blue (links on hover)
- `--color-border`: `rgb(236, 233, 233)` — light gray
- `--color-card`: `rgb(230, 230, 230)` — used sparingly (e.g., inline code bg if ever needed)

**Dark mode:**
- `--color-fill`: `rgb(10, 0, 20)` — very dark near-black (slight purple tint)
- `--color-text-base`: `rgb(220, 220, 210)` — warm off-white
- `--color-accent`: `rgb(176, 196, 222)` — light steel blue
- `--color-border`: `rgb(158, 177, 204)`
- `--color-card`: `rgb(32, 30, 44)`

**Theme toggle behavior:**
- On first visit, respect `prefers-color-scheme` system setting.
- Toggle in the header switches between light and dark; the choice is stored in `localStorage` under key `theme` (`"light"` or `"dark"`) and takes precedence over system preference on subsequent visits.
- A "clear preference" is not exposed — if the user wants to go back to system, they can clear `localStorage` manually.
- The theme is applied via `data-theme="light" | "dark"` on `<html>`, set before paint by a tiny inline script in `<head>` to prevent a flash of the wrong theme.

## Navigation & Interaction

- **From home (`/`):** reader sees the latest article. At the bottom of the article there's a small "See all articles →" link that navigates to `/articles`. (The menu icon is also always available in the header.)
- **From an article:** same menu icon in the header opens the panel; at the bottom of every article, a "← All articles" link goes to `/articles`.
- **From `/articles`:** clicking any article title goes to `/articles/[slug]`.
- **Article list panel:** always accessible; same behavior on desktop and mobile.

## Images

- Authored as relative imports in MDX, e.g. `import hero from './_images/my-north-star-hero.jpg'` then `<Image src={hero} alt="..." />` using Astro's built-in `<Image>` component.
- Astro generates multiple sizes + modern formats (AVIF/WebP) at build time with appropriate `srcset`.
- No lightbox, no zoom — clicking an image does nothing. Keep it simple.

## RSS Feed

- Generated via the official `@astrojs/rss` integration at build time.
- Includes: title, link, pubDate, description (from frontmatter; falls back to first paragraph if absent).
- Feed URL: `/rss.xml`, linked from `<head>` via `<link rel="alternate" type="application/rss+xml">` so readers auto-discover it.

## SEO & Meta

- Every page has `<title>` (page-specific), `<meta name="description">`, and Open Graph tags (`og:title`, `og:description`, `og:type="article"` on articles). No generated OG images for v1 — just the tags.
- Sitemap generated via `@astrojs/sitemap` at `/sitemap-index.xml`.
- `robots.txt` at `/robots.txt` allowing all crawlers, pointing to the sitemap.

## Analytics

- Vercel Web Analytics, enabled via `@vercel/analytics/astro` (or equivalent Astro integration).
- Pageview tracking only. No custom events.
- Zero cookies; nothing to disclose in a privacy banner.

## Favicon

- 🍔 emoji rendered as an SVG favicon:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y=".9em" font-size="90">🍔</text>
  </svg>
  ```
- Served from `public/favicon.svg`, linked via `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

## Deployment

**Target:** Vercel, free hobby tier, static output.

**Flow:**
```
local dev ──git push──> github.com/connorwang/blog ──auto-deploy──> Vercel
                                 │
                        ┌────────┴────────┐
                        │                 │
                   master branch    feature branches
                        │                 │
              production domain     preview URL per branch/PR
```

**Setup checklist (covered in the implementation plan):**
1. Create `github.com/connorwang/blog` as an empty repo.
2. Initialize Astro project locally, commit, push to `master`.
3. Import the repo in Vercel — it auto-detects Astro, no config needed.
4. Add Connor's custom domain in Vercel dashboard, configure DNS.
5. Enable Vercel Web Analytics in the project dashboard.

**Build command:** `astro build`
**Output dir:** `dist/`
**Node version:** 20.x (latest LTS)
**Dev server:** `astro dev` at `localhost:4321`

## Accessibility

- `<html lang="en">` set on every page.
- Skip-to-content link at the very top of the page (visually hidden until focused).
- All images require `alt` text (enforced at MDX authoring time — missing alt is a lint warning; not a build failure for v1).
- Color contrast verified for both themes against WCAG AA for body text.
- Menu panel is keyboard-accessible: `Esc` closes, focus trap while open, focus returned to the triggering button on close.

## Project Structure

```
blog/
├── astro.config.mjs           # Astro config: integrations (MDX, RSS, sitemap, Tailwind, Vercel Analytics)
├── tailwind.config.mjs        # Tailwind config: custom colors, fonts, typography plugin
├── tsconfig.json
├── package.json
├── public/
│   └── favicon.svg            # 🍔
├── src/
│   ├── components/
│   │   ├── Header.astro       # site header: name, menu icon, theme toggle
│   │   ├── Footer.astro       # copyright line
│   │   ├── ArticleList.astro  # the slide-in panel
│   │   ├── ThemeToggle.astro  # theme toggle button + inline pre-paint script
│   │   └── ArticleCard.astro  # one row on /articles (title + date)
│   ├── content/
│   │   ├── config.ts          # content collection schema (articles only)
│   │   └── articles/
│   │       └── _images/
│   ├── layouts/
│   │   └── BaseLayout.astro   # <html>, <head>, header, footer, panel slot
│   ├── pages/
│   │   ├── index.astro        # inlines the latest article
│   │   ├── about.mdx          # standalone MDX page (not a collection)
│   │   ├── articles/
│   │   │   ├── index.astro    # month-grouped list
│   │   │   └── [slug].astro   # single article
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   └── styles/
│       └── global.css         # tailwind layers, custom properties, font imports
└── docs/superpowers/specs/    # this spec
```

## Open Questions (Resolved)

- ✅ Homepage shows most recent article inline (not a landing/bio page).
- ✅ No persistent sidebar — article list opens from a menu icon.
- ✅ Articles index page exists, grouped by month, shows title + date.
- ✅ Typography: Newsreader + Inter.
- ✅ Dark mode with manual toggle, system default on first visit.
- ✅ No code blocks; images are supported.
- ✅ Drafts supported via `draft: true` frontmatter.
- ✅ Hosting: Vercel. Domain: user's existing domain (name TBD by user at deploy time).
- ✅ Branch: `master`. Repo: `github.com/connorwang/blog`.
- ✅ RSS at `/rss.xml`. Favicon: 🍔. Analytics: Vercel Web Analytics.

## Success Criteria

- `npm run dev` starts a local server with hot reload.
- `npm run build` produces a static `dist/` with no type errors and no missing frontmatter errors.
- Pushing to `master` on GitHub deploys to the user's Vercel domain within ~60 seconds.
- All routes listed above render correctly in both light and dark modes.
- An article with a `.mdx` file and a valid image reference renders with the image optimized.
- The menu panel opens, closes on `Esc`, and returns focus to the menu button.
- The theme toggle persists across page loads and does not flash the wrong theme.
- Lighthouse scores ≥ 95 across Performance, Accessibility, Best Practices, SEO on a representative article page.
