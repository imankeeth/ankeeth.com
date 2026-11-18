import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getNotes, notePath } from '../lib/notes';

export const GET: APIRoute = async ({ site }) => rss({
  title: 'Notes by Ankeeth Suvarna',
  description: 'Short observations on building software and AI agents.',
  site: site!,
  items: (await getNotes()).map(({ id, data }) => ({
    title: data.title,
    description: data.description,
    pubDate: new Date(data.publishedOn),
    link: notePath(id),
  })),
});
