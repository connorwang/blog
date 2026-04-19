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

export interface MonthGroup {
  key: string;
  label: string;
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
    const month = d.getMonth();
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
