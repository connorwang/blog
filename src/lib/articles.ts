import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export async function getAllArticles(
  opts: { includeDrafts?: boolean } = {},
): Promise<Article[]> {
  const includeDrafts = opts.includeDrafts ?? import.meta.env.MODE === 'development';
  const all = await getCollection('articles');
  const filtered = includeDrafts ? all : all.filter((a) => !a.data.draft);
  return filtered.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
