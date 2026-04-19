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
