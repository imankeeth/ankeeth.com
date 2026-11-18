import type { APIRoute } from 'astro';
import { getNotes, notePath } from '../../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const notes = (await getNotes()).map(({ id, data }) => ({
    id,
    title: data.title,
    description: data.description,
    publishedOn: data.publishedOn,
    url: new URL(notePath(id), site).href,
    markdownUrl: new URL(`/markdown${notePath(id)}index.md`, site).href,
  }));
  return new Response(JSON.stringify({ version: 1, notes }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
