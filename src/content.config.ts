import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const collections = {
  notes: defineCollection({
    loader: glob({ base: './src/content/notes', pattern: '[!_]*.md' }),
    schema: z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      publishedOn: z.iso.date(),
      draft: z.boolean().default(false),
    }),
  }),
};
