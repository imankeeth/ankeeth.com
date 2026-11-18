import { createHash } from 'node:crypto';

export interface NoteCardData { title: string; description: string }
// Bump the template version when changing the renderer or its font.
export const noteCardKey = (data: NoteCardData) =>
  createHash('sha256').update(JSON.stringify(['note-card-v1', data.title, data.description])).digest('hex').slice(0, 20);
export const noteCardPath = (data: NoteCardData) => `/og/notes/${noteCardKey(data)}.png`;

export function cardExcerpt(text: string, limit: number): string {
  const characters = Array.from(text.replace(/\s+/gu, ' ').trim());
  return characters.length > limit ? `${characters.slice(0, limit - 1).join('').trimEnd()}…` : characters.join('');
}
