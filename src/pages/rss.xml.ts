import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllArticles, articleSlug } from '../lib/articles';

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
      link: `/articles/${articleSlug(a)}`,
    })),
  });
}
