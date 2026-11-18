import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { cardExcerpt, type NoteCardData } from './note-card';

const require = createRequire(import.meta.url);
const font = readFile(require.resolve('@fontsource/archivo/files/archivo-latin-400-normal.woff'));

export async function renderNoteCard(data: NoteCardData): Promise<Uint8Array<ArrayBuffer>> {
  const title = cardExcerpt(data.title, 110);
  const description = cardExcerpt(data.description, 180);
  const svg = await satori({
    type: 'div',
    props: {
      style: { display: 'flex', boxSizing: 'border-box', flexDirection: 'column', width: 1200, height: 630, padding: '70px 88px', backgroundColor: '#eeecea', color: '#292a27', fontFamily: 'Archivo' },
      children: [
        { type: 'div', props: { style: { fontSize: 21, letterSpacing: 3, color: '#4d6047', marginBottom: 38 }, children: 'ANKEETH.COM / NOTES' } },
        { type: 'div', props: { style: { width: '100%', flexShrink: 0, fontSize: title.length > 70 ? 48 : 60, lineHeight: 1.12, lineClamp: 3, maxHeight: 202, overflow: 'hidden', wordBreak: 'break-word', textOverflow: 'ellipsis' }, children: title } },
        { type: 'div', props: { style: { width: '100%', flexShrink: 0, fontSize: 27, lineHeight: 1.4, color: '#4d6047', marginTop: 25, lineClamp: 3, maxHeight: 114, overflow: 'hidden', wordBreak: 'break-word', textOverflow: 'ellipsis' }, children: description } },
        { type: 'div', props: { style: { display: 'flex', marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #bfc3b9', fontSize: 23, color: '#4d6047' }, children: 'Ankeeth Suvarna' } },
      ],
    },
  }, { width: 1200, height: 630, fonts: [{ name: 'Archivo', data: await font, weight: 400, style: 'normal' }] });
  return new Uint8Array(new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng());
}
