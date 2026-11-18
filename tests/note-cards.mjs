import assert from 'node:assert/strict';
import { readFile, writeFile, rm, readdir, mkdir, copyFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['card-test-published', 'card-test-long', 'card-test-draft'].map((id) => `${root}src/content/notes/${id}.md`);
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { cwd: root, stdio: 'pipe' });
const html = (id) => readFile(`${root}dist/notes/${id}/index.html`, 'utf8');
const card = (markup) => markup.match(/property="og:image" content="https:\/\/ankeeth.com([^" ]+)"/)[1];
const fixture = (title, description, draft = false) => `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npublishedOn: '2026-11-18'\ndraft: ${draft}\n---\nTemporary verification fixture.\n`;
const title = 'Reliable AI agents start with explicit state';
const description = 'A practical note on making agent workflows easier to understand, recover, and trust when the unexpected happens.';
const created = [];
build();
const baselineCards = await readdir(`${root}dist/og/notes`).catch((error) => {
  if (error.code === 'ENOENT') return [];
  throw error;
});
try {
  for (const path of files) {
    await writeFile(path, '', { flag: 'wx' });
    created.push(path);
  }
  await writeFile(files[0], fixture(title, description));
  await writeFile(files[1], fixture('Long titles with predictable wrapping '.repeat(12), 'W'.repeat(250)));
  await writeFile(files[2], fixture('Private draft must stay private', 'Not public.', true));
  build();
  const first = card(await html('card-test-published'));
  const long = card(await html('card-test-long'));
  assert.notEqual(first, long);
  for (const [id, path] of [['card-test-published', first], ['card-test-long', long]]) {
    const markup = await html(id);
    assert.ok(markup.includes(`name="twitter:image" content="https://ankeeth.com${path}"`));
    assert.match(markup, /property="og:image:alt"/);
    const png = await readFile(`${root}dist${path}`);
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
  await assert.rejects(access(`${root}dist/notes/card-test-draft/index.html`));
  assert.equal((await readdir(`${root}dist/og/notes`)).length, baselineCards.length + 2);
  assert.doesNotMatch(await readFile(`${root}dist/sitemap-0.xml`, 'utf8'), /\/og\/|\.png|card-test-draft/);
  assert.ok((await readFile(`${root}dist/index.html`, 'utf8')).includes('content="https://ankeeth.com/social-card-home.png"'));
  // Optional preview output stays outside the source tree and never deploys.
  if (process.env.NOTE_CARD_PREVIEW_DIR) {
    await mkdir(process.env.NOTE_CARD_PREVIEW_DIR, { recursive: true });
    await copyFile(`${root}dist${first}`, `${process.env.NOTE_CARD_PREVIEW_DIR}/note-card.png`);
    await copyFile(`${root}dist${long}`, `${process.env.NOTE_CARD_PREVIEW_DIR}/note-card-long.png`);
  }
  await writeFile(files[0], fixture(`${title} (edited)`, description));
  build();
  assert.notEqual(card(await html('card-test-published')), first);
  await assert.rejects(access(`${root}dist${first}`));
  console.log('Note cards: published/draft, PNG dimensions, metadata, sitemap exclusion and content hash passed.');
} finally {
  await Promise.all(created.map((path) => rm(path)));
  build();
}
