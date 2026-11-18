import type { APIRoute, GetStaticPaths } from 'astro';
import { getNotes } from '../../../lib/notes';
import { noteCardKey, type NoteCardData } from '../../../lib/note-card';
import { renderNoteCard } from '../../../lib/render-note-card';

export const prerender = true;
export const getStaticPaths = (async () => {
  const cards = new Map((await getNotes()).map(({ data }) => [noteCardKey(data), data]));
  return [...cards].map(([key, data]) => ({ params: { key }, props: { data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => new Response(
  await renderNoteCard(props.data as NoteCardData),
  { headers: { 'Content-Type': 'image/png' } },
);
