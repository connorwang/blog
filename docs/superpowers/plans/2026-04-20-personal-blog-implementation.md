# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Connor's personal blog — a static Astro + MDX + Tailwind site on Vercel, visually modeled on raealisa.com but with a menu-driven article navigator instead of a sidebar.

**Architecture:** Static site generated at build time. Articles are MDX files in an Astro content collection with typed frontmatter. Three display routes (`/`, `/articles`, `/articles/[slug]`), one About page, an RSS feed, and a sitemap. A single `BaseLayout` wraps every page with the header (name + menu icon + theme toggle), an always-available slide-in article panel, and a minimal footer. Dark/light themes are driven by a CSS custom-property palette switched on `<html data-theme>`.

**Tech Stack:** Astro 4, MDX, Tailwind CSS, `@astrojs/rss`, `@astrojs/sitemap`, `@vercel/analytics`, Vitest (for testing pure helpers only), Node 20 LTS, deployed to Vercel from `github.com/connorwang/blog`'s `master` branch.

**Spec:** `docs/superpowers/specs/2026-04-19-personal-blog-design.md`

---

## File structure

```
blog/
├── .gitignore
├── .nvmrc                        # Node 20
├── README.md                     # minimal: how to dev/build/deploy
├── astro.config.mjs              # integrations: mdx, tailwind, sitemap, vercel
├── tailwind.config.mjs           # custom colors, fonts, typography plugin
├── tsconfig.json
├── vitest.config.ts              # tests for pure helpers
├── package.json
├── public/
│   ├── favicon.svg               # 🍔 emoji SVG
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Header.astro          # name, menu icon, theme toggle
│   │   ├── Footer.astro          # © Connor
│   │   ├── ArticleList.astro     # slide-in panel (overlay + list)
│   │   ├── ThemeToggle.astro     # sun/moon button, inline pre-paint script
│   │   └── ArticleRow.astro      # one row of the /articles index
│   ├── content/
│   │   ├── config.ts             # article collection schema
│   │   └── articles/
│   │       ├── 2026-04-20-hello-world.mdx
│   │       └── _images/
│   │           └── .gitkeep
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <html>, head, header, footer, panel slot
│   │   └── ArticleLayout.astro   # article-specific wrapper (title block + prose)
│   ├── lib/
│   │   ├── articles.ts           # getAllArticles, groupByMonth
│   │   └── articles.test.ts      # unit tests
│   ├── pages/
│   │   ├── index.astro           # inlines latest article
│   │   ├── about.mdx             # standalone MDX page
│   │   ├── articles/
│   │   │   ├── index.astro       # month-grouped list
│   │   │   └── [slug].astro      # single article
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   └── styles/
│       └── global.css            # tailwind layers + color custom properties + font imports
└── docs/superpowers/
    ├── specs/2026-04-19-personal-blog-design.md
    └── plans/2026-04-20-personal-blog-implementation.md
```

**Design notes on the decomposition:**
- `lib/articles.ts` holds the only real logic (listing + grouping articles). It's tested; everything else is declarative markup.
- Layouts are split: `BaseLayout` is page shell (identical everywhere), `ArticleLayout` adds the title block + prose styling. Keeping them separate means `/articles` and `/about` reuse `BaseLayout` without inheriting article-specific wrapping.
- `ArticleList.astro` encapsulates both the trigger-driven panel and the list itself. Header just renders the button and imports the panel.
- `ThemeToggle.astro` owns both the button markup and the inline no-flash script; keeping them together prevents drift.

---

## Phase 1: Scaffold project

### Task 1: Initialize git repo and baseline files

**Files:**
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `README.md`

- [ ] **Step 1: Initialize git repo**

Run from `/Users/cwang/Projects/blog`:
```bash
git init
git config init.defaultBranch master
git checkout -b master 2>/dev/null || true
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
# dependencies
node_modules/

# astro build output
dist/
.astro/

# vercel
.vercel/

# env
.env
.env.local
.env.*.local

# macOS
.DS_Store

# editor
.vscode/
.idea/

# logs
npm-debug.log*
*.log
```

- [ ] **Step 3: Create `.nvmrc`**

```
20
```

- [ ] **Step 4: Create `README.md`**

```markdown
# Connor's Blog

Personal blog at [connor's domain]. Static site built with Astro.

## Dev

```bash
nvm use
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
npm test           # unit tests for helpers
```

## Deploy

Push to `master` → Vercel auto-deploys. Feature branches get preview URLs.

## Write an article

Drop a file in `src/content/articles/YYYY-MM-DD-slug.mdx` with this frontmatter:

```yaml
---
title: "Your title"
date: 2026-04-20
description: "Optional short description."
draft: false
---
```

Set `draft: true` to hide from production builds while keeping the file committed.
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore .nvmrc README.md
git commit -m "chore: initial repo scaffolding"
```

---

### Task 2: Install Astro + MDX + Tailwind + tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "blog",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/check": "^0.9.0",
    "@tailwindcss/typography": "^0.5.15",
    "@vercel/analytics": "^1.4.0",
    "astro": "^4.16.0",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// NOTE: site URL must be set before production deploy (used by sitemap + RSS).
// Replace with the real domain when configuring Vercel.
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    mdx(),
    tailwind({ applyBaseStyles: false }), // we provide our own base in global.css
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' }, // harmless default; articles don't use code blocks
  },
});
```

- [ ] **Step 4: Create `tailwind.config.mjs`**

```js
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        fill: 'rgb(var(--color-fill) / <alpha-value>)',
        text: 'rgb(var(--color-text-base) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
      },
      fontFamily: {
        body: ['Newsreader', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        page: '48rem',
        prose: '65ch',
      },
    },
  },
  plugins: [typography],
};
```

- [ ] **Step 5: Install**

```bash
npm install
```
Expected: dependencies install without errors; a `package-lock.json` is created.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs tailwind.config.mjs
git commit -m "chore: install astro, mdx, tailwind, rss, sitemap"
```

---

### Task 3: Global CSS with fonts, colors, theme variables

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root,
  html[data-theme='light'] {
    --color-fill: 251 254 251;
    --color-text-base: 40 39 40;
    --color-accent: 0 108 172;
    --color-border: 236 233 233;
    --color-card: 230 230 230;
  }

  html[data-theme='dark'] {
    --color-fill: 10 0 20;
    --color-text-base: 220 220 210;
    --color-accent: 176 196 222;
    --color-border: 158 177 204;
    --color-card: 32 30 44;
  }

  html {
    font-family: 'Newsreader', Georgia, serif;
    background-color: rgb(var(--color-fill));
    color: rgb(var(--color-text-base));
  }

  body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* UI-chrome elements (header, nav, buttons) use Inter */
  header, nav, button, .ui {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .skip-link {
    @apply absolute -top-full left-4 z-50 bg-accent text-fill px-3 py-2 transition-all focus:top-4;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: global css with theme variables and fonts"
```

---

### Task 4: Vitest config for helper tests

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: vitest config for helper tests"
```

---

## Phase 2: Content collection + helpers (TDD)

### Task 5: Define the articles content collection schema

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    date: z.date(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase-kebab-case')
      .optional(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
```

- [ ] **Step 2: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: articles content collection schema"
```

---

### Task 6: Write failing test for `getAllArticles`

**Files:**
- Create: `src/lib/articles.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';

// Mock astro:content before importing the module under test
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from 'astro:content';
import { getAllArticles } from './articles';

type Entry = CollectionEntry<'articles'>;

const make = (overrides: Partial<Entry['data']> & { slug?: string }): Entry =>
  ({
    id: `${overrides.slug ?? 'x'}.mdx`,
    slug: overrides.slug ?? 'x',
    collection: 'articles',
    data: {
      title: overrides.title ?? 'T',
      date: overrides.date ?? new Date('2026-01-01'),
      draft: overrides.draft ?? false,
      description: overrides.description,
    },
  }) as unknown as Entry;

describe('getAllArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns articles sorted by date descending', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      make({ slug: 'a', date: new Date('2026-01-10') }),
      make({ slug: 'b', date: new Date('2026-03-05') }),
      make({ slug: 'c', date: new Date('2026-02-14') }),
    ]);

    const result = await getAllArticles();
    expect(result.map((a) => a.slug)).toEqual(['b', 'c', 'a']);
  });

  it('excludes drafts by default', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      make({ slug: 'published', draft: false }),
      make({ slug: 'wip', draft: true }),
    ]);

    const result = await getAllArticles();
    expect(result.map((a) => a.slug)).toEqual(['published']);
  });

  it('includes drafts when includeDrafts=true', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      make({ slug: 'published', draft: false }),
      make({ slug: 'wip', draft: true }),
    ]);

    const result = await getAllArticles({ includeDrafts: true });
    expect(result.map((a) => a.slug).sort()).toEqual(['published', 'wip']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```
Expected: FAIL — `Cannot find module './articles'` or similar missing-export error.

---

### Task 7: Implement `getAllArticles`

**Files:**
- Create: `src/lib/articles.ts`

- [ ] **Step 1: Write the minimal implementation**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export async function getAllArticles(
  opts: { includeDrafts?: boolean } = {},
): Promise<Article[]> {
  const includeDrafts =
    opts.includeDrafts ?? import.meta.env.MODE === 'development';
  const all = await getCollection('articles');
  const filtered = includeDrafts ? all : all.filter((a) => !a.data.draft);
  return filtered.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
```

Note: `import.meta.env.MODE` is `'development'` during `astro dev`, `'production'` during `astro build`, and `'test'` under vitest. Gating on `=== 'development'` gives the intended semantic (drafts shown in dev server only) and makes tests default to draft-excluded — matching production behavior. The test overrides with `includeDrafts: true` explicitly when needed.

- [ ] **Step 2: Run test to verify it passes**

```bash
npm test
```
Expected: PASS — all three `getAllArticles` tests green.

- [ ] **Step 3: Commit**

```bash
git add src/lib/articles.ts src/lib/articles.test.ts
git commit -m "feat: getAllArticles helper with draft filtering"
```

---

### Task 8: Write failing test for `groupByMonth`

**Files:**
- Modify: `src/lib/articles.test.ts` (append)

- [ ] **Step 1: Append the failing test**

Append at the bottom of `src/lib/articles.test.ts`:

```ts
import { groupByMonth } from './articles';

describe('groupByMonth', () => {
  it('groups sorted articles into { label, articles } buckets', () => {
    const articles = [
      make({ slug: 'apr2', date: new Date('2026-04-07') }),
      make({ slug: 'apr1', date: new Date('2026-04-01') }),
      make({ slug: 'mar1', date: new Date('2026-03-22') }),
    ];

    const groups = groupByMonth(articles);

    expect(groups).toEqual([
      {
        key: '2026-04',
        label: 'April 2026',
        articles: [articles[0], articles[1]],
      },
      {
        key: '2026-03',
        label: 'March 2026',
        articles: [articles[2]],
      },
    ]);
  });

  it('returns an empty array for no articles', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```
Expected: FAIL — `groupByMonth` is not exported.

---

### Task 9: Implement `groupByMonth`

**Files:**
- Modify: `src/lib/articles.ts` (append)

- [ ] **Step 1: Append the implementation**

Append at the bottom of `src/lib/articles.ts`:

```ts
export interface MonthGroup {
  key: string;           // e.g. "2026-04"
  label: string;         // e.g. "April 2026"
  articles: Article[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function groupByMonth(articles: Article[]): MonthGroup[] {
  const buckets = new Map<string, MonthGroup>();

  for (const article of articles) {
    const d = article.data.date;
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    let group = buckets.get(key);
    if (!group) {
      group = {
        key,
        label: `${MONTH_NAMES[month]} ${year}`,
        articles: [],
      };
      buckets.set(key, group);
    }
    group.articles.push(article);
  }

  return Array.from(buckets.values());
}
```

Note: preserves the input ordering inside each bucket, and returns groups in the order they first appeared — which means if the caller passes a date-descending list (as `getAllArticles` does), the groups come out descending too.

- [ ] **Step 2: Run test to verify it passes**

```bash
npm test
```
Expected: PASS — both `groupByMonth` tests green.

- [ ] **Step 3: Commit**

```bash
git add src/lib/articles.ts src/lib/articles.test.ts
git commit -m "feat: groupByMonth helper"
```

---

## Phase 3: Layout primitives

### Task 10: Create `BaseLayout.astro`

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the layout**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import ArticleList from '../components/ArticleList.astro';

interface Props {
  title: string;
  description?: string;
  ogType?: 'website' | 'article';
}

const {
  title,
  description = "Connor's personal blog.",
  ogType = 'website',
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link
      rel="alternate"
      type="application/rss+xml"
      title="Connor's Blog"
      href="/rss.xml"
    />

    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />

    <!-- No-flash theme bootstrap: must run before first paint. -->
    <script is:inline>
      (() => {
        const stored = localStorage.getItem('theme');
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        const theme = stored === 'light' || stored === 'dark' ? stored : system;
        document.documentElement.dataset.theme = theme;
      })();
    </script>
  </head>
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <Header />
    <main id="main" class="mx-auto w-full max-w-page px-4 flex-1">
      <slot />
    </main>
    <Footer />
    <ArticleList />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout with head meta and theme bootstrap"
```

---

### Task 11: Create `Footer.astro`

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create the footer**

```astro
---
const year = new Date().getFullYear();
---
<footer class="mx-auto w-full max-w-page px-4 py-6 text-center text-sm opacity-60">
  © {year} Connor
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: minimal footer"
```

---

### Task 12: Create `ThemeToggle.astro`

**Files:**
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Create the toggle**

```astro
---
// Renders a single button that toggles html[data-theme] and persists to localStorage.
// The pre-paint bootstrap lives in BaseLayout — this script only handles click.
---
<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle color theme"
  class="p-1 hover:opacity-75 transition-opacity"
>
  <svg
    id="theme-toggle-sun"
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5 hidden"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
  <svg
    id="theme-toggle-moon"
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5 hidden"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
</button>

<script is:inline>
  (() => {
    const btn = document.getElementById('theme-toggle');
    const sun = document.getElementById('theme-toggle-sun');
    const moon = document.getElementById('theme-toggle-moon');

    const sync = () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      // Show the icon of what you'd switch TO.
      sun.classList.toggle('hidden', !isDark);
      moon.classList.toggle('hidden', isDark);
    };
    sync();

    btn.addEventListener('click', () => {
      const next =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      sync();
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: theme toggle button"
```

---

### Task 13: Create `ArticleList.astro` (slide-in panel)

**Files:**
- Create: `src/components/ArticleList.astro`

- [ ] **Step 1: Create the panel**

```astro
---
import { getAllArticles } from '../lib/articles';

const articles = await getAllArticles();
---
<div
  id="article-panel"
  class="fixed inset-0 z-40 hidden"
  aria-hidden="true"
>
  <div
    id="article-panel-overlay"
    class="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200"
  ></div>
  <aside
    id="article-panel-aside"
    role="dialog"
    aria-modal="true"
    aria-label="Article navigation"
    class="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-fill text-text translate-x-full transition-transform duration-200 shadow-xl flex flex-col"
    tabindex="-1"
  >
    <div class="flex items-center justify-between p-4">
      <a
        href="/articles"
        class="font-ui font-medium hover:underline underline-offset-4"
      >
        All articles
      </a>
      <button
        id="article-panel-close"
        type="button"
        aria-label="Close article navigation"
        class="p-1 hover:opacity-75"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-2">
      <ul class="space-y-2">
        {articles.map((a) => (
          <li>
            <a
              href={`/articles/${a.data.slug ?? a.slug}`}
              class="block py-1 hover:underline underline-offset-4 decoration-dashed"
            >
              {a.data.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div class="p-4 border-t border-border/40">
      <a
        href="/about"
        class="font-ui font-medium hover:underline underline-offset-4"
      >
        About
      </a>
    </div>
  </aside>
</div>

<script is:inline>
  (() => {
    const panel = document.getElementById('article-panel');
    const overlay = document.getElementById('article-panel-overlay');
    const aside = document.getElementById('article-panel-aside');
    const closeBtn = document.getElementById('article-panel-close');
    let lastFocused = null;

    const open = () => {
      lastFocused = document.activeElement;
      panel.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
      // next frame so transition actually plays
      requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        aside.classList.remove('translate-x-full');
      });
      aside.focus();
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      overlay.classList.add('opacity-0');
      aside.classList.add('translate-x-full');
      panel.setAttribute('aria-hidden', 'true');
      setTimeout(() => panel.classList.add('hidden'), 200);
      document.body.style.overflow = '';
      if (lastFocused instanceof HTMLElement) lastFocused.focus();
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-article-panel-trigger]');
      if (trigger) {
        e.preventDefault();
        open();
      }
    });

    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) close();
    });
  })();
</script>
```

Note: the trigger button (menu icon `☰`) lives in the Header and is wired up by the `data-article-panel-trigger` attribute, kept separate so the Header doesn't need to import state.

- [ ] **Step 2: Commit**

```bash
git add src/components/ArticleList.astro
git commit -m "feat: slide-in article panel with a11y"
```

---

### Task 14: Create `Header.astro`

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: Create the header**

```astro
---
import ThemeToggle from './ThemeToggle.astro';
---
<header class="w-full">
  <div class="mx-auto w-full max-w-page px-4 py-4 sm:py-8 flex items-center justify-between">
    <a
      href="/"
      class="font-ui font-semibold text-xl sm:text-2xl hover:opacity-80"
    >
      Connor
    </a>
    <div class="flex items-center gap-2">
      <button
        type="button"
        aria-label="Open article navigation"
        data-article-panel-trigger
        class="p-1 hover:opacity-75"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <ThemeToggle />
    </div>
  </div>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: header with menu trigger and theme toggle"
```

---

### Task 15: Create `ArticleLayout.astro`

**Files:**
- Create: `src/layouts/ArticleLayout.astro`

- [ ] **Step 1: Create the layout**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  date: Date;
  description?: string;
}

const { title, date, description } = Astro.props;

const formatted = date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={title} description={description} ogType="article">
  <article class="mx-auto max-w-prose py-8 sm:py-12">
    <header class="mb-8">
      <h1 class="font-body text-4xl sm:text-5xl font-bold leading-tight mb-2">
        {title}
      </h1>
      <time datetime={date.toISOString()} class="text-sm opacity-60 font-ui">
        {formatted}
      </time>
    </header>
    <div
      class="prose prose-lg max-w-none
             prose-headings:font-body
             prose-h2:font-bold prose-h3:italic prose-h3:font-semibold
             prose-a:text-text prose-a:decoration-dashed prose-a:underline-offset-8
             prose-a:hover:text-accent
             prose-img:rounded prose-img:my-8
             prose-blockquote:border-accent/50"
    >
      <slot />
    </div>
    <div class="mt-16 pt-6 border-t border-border/40">
      <a href="/articles" class="font-ui text-sm hover:underline underline-offset-4">
        ← All articles
      </a>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ArticleLayout.astro
git commit -m "feat: ArticleLayout with title block and prose styling"
```

---

## Phase 4: Pages

### Task 16: Create `/articles/[slug].astro`

**Files:**
- Create: `src/pages/articles/[slug].astro`

- [ ] **Step 1: Create the page**

```astro
---
import { getAllArticles, type Article } from '../../lib/articles';
import ArticleLayout from '../../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const articles = await getAllArticles();
  return articles.map((a) => ({
    params: { slug: a.data.slug ?? a.slug },
    props: { article: a },
  }));
}

interface Props {
  article: Article;
}

const { article } = Astro.props;
const { Content } = await article.render();
---

<ArticleLayout
  title={article.data.title}
  date={article.data.date}
  description={article.data.description}
>
  <Content />
</ArticleLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/articles/[slug].astro
git commit -m "feat: single article route"
```

---

### Task 17: Create `/index.astro` (latest article)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create the page**

```astro
---
import { getAllArticles } from '../lib/articles';
import ArticleLayout from '../layouts/ArticleLayout.astro';
import BaseLayout from '../layouts/BaseLayout.astro';

const articles = await getAllArticles();
const latest = articles[0];

let Content: Awaited<ReturnType<NonNullable<typeof latest>['render']>>['Content'] | null = null;
if (latest) {
  // Pre-render the MDX content so it appears inline on the homepage.
  ({ Content } = await latest.render());
}
---

{latest && Content ? (
  <ArticleLayout
    title={latest.data.title}
    date={latest.data.date}
    description={latest.data.description}
  >
    <Content />
  </ArticleLayout>
) : (
  <BaseLayout title="Connor's Blog">
    <div class="mx-auto max-w-prose py-16 text-center">
      <p class="opacity-70">No articles yet — check back soon.</p>
    </div>
  </BaseLayout>
)}
```

Note: using `var` so `Content` is accessible in the template. Astro's frontmatter script hoists `var` to module scope, which matters here because `Content` is conditionally assigned.

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage renders latest article"
```

---

### Task 18: Create `/articles/index.astro` (month-grouped list)

**Files:**
- Create: `src/pages/articles/index.astro`
- Create: `src/components/ArticleRow.astro`

- [ ] **Step 1: Create `ArticleRow.astro`**

```astro
---
import type { Article } from '../lib/articles';

interface Props {
  article: Article;
}

const { article } = Astro.props;

const formatted = article.data.date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
---
<li class="flex items-baseline justify-between gap-4 py-1">
  <a
    href={`/articles/${article.data.slug ?? article.slug}`}
    class="font-body hover:underline decoration-dashed underline-offset-4"
  >
    {article.data.title}
  </a>
  <time
    datetime={article.data.date.toISOString()}
    class="text-sm opacity-60 font-ui whitespace-nowrap"
  >
    {formatted}
  </time>
</li>
```

- [ ] **Step 2: Create `articles/index.astro`**

```astro
---
import { getAllArticles, groupByMonth } from '../../lib/articles';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleRow from '../../components/ArticleRow.astro';

const articles = await getAllArticles();
const groups = groupByMonth(articles);
---

<BaseLayout title="Articles — Connor's Blog">
  <div class="mx-auto max-w-prose py-8 sm:py-12">
    <h1 class="font-body text-3xl sm:text-4xl font-bold mb-8">Articles</h1>
    {groups.length === 0 ? (
      <p class="opacity-70">No articles yet.</p>
    ) : (
      groups.map((group) => (
        <section class="mb-10">
          <h2 class="font-ui text-sm uppercase tracking-wider opacity-60 mb-3">
            {group.label}
          </h2>
          <ul>
            {group.articles.map((a) => <ArticleRow article={a} />)}
          </ul>
        </section>
      ))
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/articles/index.astro src/components/ArticleRow.astro
git commit -m "feat: articles index page grouped by month"
```

---

### Task 19: Create `/about.mdx`

**Files:**
- Create: `src/pages/about.mdx`

- [ ] **Step 1: Create the page**

```mdx
---
layout: ../layouts/BaseLayout.astro
title: "About — Connor's Blog"
description: "About Connor."
---

<div class="mx-auto max-w-prose py-8 sm:py-12 prose prose-lg max-w-none prose-headings:font-body">

# About

Hi, I'm Connor. This is my blog.

_Replace this with your real bio before you deploy._

</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/about.mdx
git commit -m "feat: about page placeholder"
```

---

### Task 20: Create `/404.astro`

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Not Found — Connor's Blog">
  <div class="mx-auto max-w-prose py-16 text-center">
    <h1 class="font-body text-5xl font-bold mb-4">404</h1>
    <p class="opacity-70 mb-8">This page doesn't exist.</p>
    <a href="/" class="font-ui hover:underline underline-offset-4">← Home</a>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: 404 page"
```

---

### Task 21: Create `/rss.xml.ts`

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Create the feed**

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllArticles } from '../lib/articles';

export async function GET(context: APIContext) {
  const articles = await getAllArticles();
  return rss({
    title: "Connor's Blog",
    description: "Connor's writing.",
    site: context.site ?? 'https://example.com',
    items: articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: a.data.description ?? '',
      link: `/articles/${a.data.slug ?? a.slug}`,
    })),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: rss feed at /rss.xml"
```

---

## Phase 5: Public assets + analytics

### Task 22: Create favicon and robots.txt

**Files:**
- Create: `public/favicon.svg`
- Create: `public/robots.txt`

- [ ] **Step 1: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y="0.9em" font-size="90">🍔</text>
</svg>
```

- [ ] **Step 2: Create `public/robots.txt`**

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

Note: the sitemap URL will be updated once the real domain is configured in `astro.config.mjs`.

- [ ] **Step 3: Commit**

```bash
git add public/favicon.svg public/robots.txt
git commit -m "feat: favicon and robots.txt"
```

---

### Task 23: Add Vercel Web Analytics

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add the analytics tag**

In `src/layouts/BaseLayout.astro`, inside `<body>`, after the `<ArticleList />` component (near the bottom), add:

```astro
<script>
  import { inject } from '@vercel/analytics';
  inject();
</script>
```

Final body section should be:

```astro
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <Header />
  <main id="main" class="mx-auto w-full max-w-page px-4 flex-1">
    <slot />
  </main>
  <Footer />
  <ArticleList />
  <script>
    import { inject } from '@vercel/analytics';
    inject();
  </script>
</body>
```

Note: `@vercel/analytics` only sends data when deployed on Vercel; it no-ops locally, so no local setup needed.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: vercel web analytics"
```

---

## Phase 6: Starter content + full build verification

### Task 24: Create starter article

**Files:**
- Create: `src/content/articles/2026-04-20-hello-world.mdx`
- Create: `src/content/articles/_images/.gitkeep`

- [ ] **Step 1: Create the starter article**

```mdx
---
title: "Hello, world"
date: 2026-04-20
description: "First post on the new blog."
---

This is the first post on Connor's new blog.

## A section

Some prose here. Nothing fancy.

> A quote, to check the blockquote styling.

A paragraph linking to [Astro](https://astro.build) — which is what this site is built with.
```

- [ ] **Step 2: Create `_images/.gitkeep`**

```
```
(empty file; keeps the directory tracked in git)

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/2026-04-20-hello-world.mdx src/content/articles/_images/.gitkeep
git commit -m "content: starter hello-world article"
```

---

### Task 25: Full build verification

- [ ] **Step 1: Run typecheck + build**

```bash
npm run build
```
Expected: `astro check` passes with 0 errors, 0 warnings. Build outputs `dist/` with `index.html`, `articles/hello-world/index.html`, `articles/index.html`, `about/index.html`, `rss.xml`, `sitemap-index.xml`, `404.html`, and the `favicon.svg`.

- [ ] **Step 2: Preview locally**

```bash
npm run preview
```
Expected: server starts at `http://localhost:4321`.

- [ ] **Step 3: Manual smoke-test**

Open each URL and verify:
- `http://localhost:4321/` — shows the "Hello, world" article inline
- `http://localhost:4321/articles` — shows "April 2026" month header with one entry
- `http://localhost:4321/articles/hello-world` — shows the article
- `http://localhost:4321/about` — shows the About placeholder
- `http://localhost:4321/rss.xml` — valid RSS XML with one `<item>`
- `http://localhost:4321/sitemap-index.xml` — valid sitemap XML
- `http://localhost:4321/nonexistent` — 404 page

Verify interactively:
- Click the menu icon (`☰`) — panel slides in from the right
- Press `Esc` — panel closes, focus returns to the menu button
- Click the theme toggle — colors flip; reload the page; theme persists
- Resize browser below 640px — layout still readable, no horizontal scroll

- [ ] **Step 4: Run unit tests**

```bash
npm test
```
Expected: all 5 tests pass (3 for `getAllArticles`, 2 for `groupByMonth`).

- [ ] **Step 5: Commit any fixes**

If the smoke-test surfaced any issues, fix them now before moving on. Otherwise skip.

---

## Phase 7: Deployment

### Task 26: Create GitHub repo and push

- [ ] **Step 1: Create the repo via `gh`**

```bash
gh repo create connorwang/blog --public --source=. --remote=origin --push
```

Alternative if public-vs-private decision is "private":
```bash
gh repo create connorwang/blog --private --source=. --remote=origin --push
```

Expected: repo created at `https://github.com/connorwang/blog`, `master` branch pushed.

- [ ] **Step 2: Verify push**

```bash
git log --oneline -5
gh repo view connorwang/blog --web
```
Expected: log shows recent commits; the browser opens to the repo page with files listed.

---

### Task 27: Connect to Vercel

**Manual steps (Connor performs in browser):**

- [ ] **Step 1: Import the project**

1. Go to https://vercel.com/new
2. Select "Import Git Repository" → pick `connorwang/blog`.
3. Framework preset: Astro (auto-detected).
4. Build command: `npm run build` (default).
5. Output dir: `dist` (default).
6. Click "Deploy".

Expected: first deploy completes in ~60s, preview URL appears.

- [ ] **Step 2: Add custom domain**

1. Vercel dashboard → project → Settings → Domains.
2. Add Connor's domain (e.g., `yourname.com`).
3. Vercel shows DNS records to set at the domain registrar — either an A record pointing to `76.76.21.21`, or a CNAME on a subdomain pointing to `cname.vercel-dns.com`.
4. Wait for DNS to propagate (usually minutes).

- [ ] **Step 3: Update `astro.config.mjs` site URL**

Once the domain is active, update `site` in `astro.config.mjs`:

```js
site: 'https://yourname.com',  // replace with real domain
```

And update `public/robots.txt` sitemap line to match.

Commit + push:
```bash
git add astro.config.mjs public/robots.txt
git commit -m "chore: set production site url"
git push
```

Expected: Vercel auto-redeploys; sitemap and RSS now use the real URL.

- [ ] **Step 4: Enable Web Analytics**

Vercel dashboard → project → Analytics tab → click "Enable". No code change needed — the `@vercel/analytics` script is already injected by `BaseLayout`.

---

### Task 28: Post-deploy verification

- [ ] **Step 1: Visit the production URL**

Check that everything loads under the real domain.

- [ ] **Step 2: Run Lighthouse**

In Chrome DevTools on the production URL → Lighthouse tab → run audit for "Performance, Accessibility, Best Practices, SEO" in Mobile mode.

Expected: all four scores ≥ 95. If any score is below, investigate and fix (likely: missing meta tags, slow image, or missing `alt` text).

- [ ] **Step 3: Subscribe to the RSS feed**

Add `https://yourname.com/rss.xml` to an RSS reader (e.g., Feedly). Verify the feed loads and shows one item.

- [ ] **Step 4: Final commit**

Update the README's "[connor's domain]" placeholder to the real domain:

```bash
git add README.md
git commit -m "docs: real domain in README"
git push
```

---

## Done criteria

All of the following must be true:
- `npm test` passes (5 tests)
- `npm run build` passes with 0 errors
- Every route listed in the spec renders correctly on the production URL
- Lighthouse scores ≥ 95 in all four categories on an article page
- Theme toggle persists across reloads, no flash of wrong theme
- Menu panel opens, closes on `Esc`, and focus returns to the trigger
- RSS feed validates (https://validator.w3.org/feed/)
- Sitemap is reachable and contains every public page
- Custom domain resolves to the Vercel deployment
