import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';

// Mock astro:content before importing the module under test
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from 'astro:content';
import {
  getAllArticles,
  articleKey,
  articleLang,
} from './articles';

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

  it('returns only the default-language variant of each article by default', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      make({ slug: 'hello-world' }),
      make({ slug: 'hello-world.zh' }),
      make({ slug: 'other' }),
    ]);

    const result = await getAllArticles();
    expect(result.map((a) => a.slug).sort()).toEqual(['hello-world', 'other']);
  });

  it('returns every variant when allLanguages=true', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      make({ slug: 'hello-world' }),
      make({ slug: 'hello-world.zh' }),
    ]);

    const result = await getAllArticles({ allLanguages: true });
    expect(result.map((a) => a.slug).sort()).toEqual([
      'hello-world',
      'hello-world.zh',
    ]);
  });
});

describe('articleLang', () => {
  it('returns "en" when no language suffix is present', () => {
    expect(articleLang(make({ slug: '2026-04-20-hello-world' }))).toBe('en');
  });

  it('extracts a two-letter language suffix', () => {
    expect(articleLang(make({ slug: '2026-04-20-hello-world.zh' }))).toBe('zh');
  });

  it('extracts a region-tagged language suffix and lowercases it', () => {
    expect(articleLang(make({ slug: '2026-04-20-hello-world.zh-cn' }))).toBe(
      'zh-cn',
    );
  });
});

describe('articleKey', () => {
  it('strips the YYYY-MM-DD- date prefix', () => {
    expect(articleKey(make({ slug: '2026-04-20-hello-world' }))).toBe(
      'hello-world',
    );
  });

  it('strips both the date prefix and the language suffix', () => {
    expect(articleKey(make({ slug: '2026-04-20-hello-world.zh' }))).toBe(
      'hello-world',
    );
  });

  it('returns the slug unchanged when no date prefix or lang suffix', () => {
    expect(articleKey(make({ slug: 'plain' }))).toBe('plain');
  });
});

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
