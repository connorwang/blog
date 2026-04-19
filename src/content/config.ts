import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    date: z.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
