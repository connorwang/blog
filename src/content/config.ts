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
