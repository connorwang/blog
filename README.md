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
