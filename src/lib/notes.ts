import { getCollection } from 'astro:content';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatDate = (date: string) => dateFormatter.format(new Date(date));
export const notePath = (id: string) => `/notes/${id}/`;
export const getNotes = async () =>
  (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedOn.localeCompare(a.data.publishedOn) || a.id.localeCompare(b.id),
  );
