import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const LANG_SUFFIX = /\.([a-z]{2}(?:-[a-z]{2})?)$/i;
const MDX_EXT = /\.mdx?$/i;

export const DEFAULT_LANG = 'en';

// Canonical filename base: strip the `.mdx` extension from the content-collection id.
// Astro's auto-generated `slug` strips dots (turning "hello.zh" into "hellozh"), so
// we work from `id` instead — that keeps per-language suffixes like `.zh` intact.
function baseName(article: Article): string {
  return article.id.replace(MDX_EXT, '');
}

export function articleLang(article: Article): string {
  const m = baseName(article).match(LANG_SUFFIX);
  return m ? m[1].toLowerCase() : DEFAULT_LANG;
}

export function articleKey(article: Article): string {
  return baseName(article).replace(DATE_PREFIX, '').replace(LANG_SUFFIX, '');
}

export async function getAllArticles(
  opts: { includeDrafts?: boolean; allLanguages?: boolean } = {},
): Promise<Article[]> {
  const includeDrafts = opts.includeDrafts ?? import.meta.env.MODE === 'development';
  const all = await getCollection('articles');
  const drafted = includeDrafts ? all : all.filter((a) => !a.data.draft);
  const filtered = opts.allLanguages
    ? drafted
    : drafted.filter((a) => articleLang(a) === DEFAULT_LANG);
  return filtered.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export async function getArticleVariants(key: string): Promise<Article[]> {
  const all = await getAllArticles({ allLanguages: true });
  const variants = all.filter((a) => articleKey(a) === key);
  return variants.sort((a, b) => {
    if (articleLang(a) === DEFAULT_LANG) return -1;
    if (articleLang(b) === DEFAULT_LANG) return 1;
    return articleLang(a).localeCompare(articleLang(b));
  });
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
