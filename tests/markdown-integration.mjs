import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFile, rm, readFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
const published = 'src/content/notes/agent-readability-test.md';
const draft = 'src/content/notes/agent-readability-draft.md';
let server;
const created = [];
const build = () => execFileSync('pnpm', ['build'], { stdio: 'inherit' });
const base = 'http://127.0.0.1:4338';
const request = (path, accept = 'text/markdown', extra = {}) => fetch(base + path, { redirect: 'manual', ...extra, headers: { Accept: accept, ...extra.headers } });
try {
  await writeFile(published, "---\ntitle: Readability fixture\ndescription: Temporary local verification only.\npublishedOn: '2026-11-18'\n---\n\n## Same source\n\nA **bold** word, `code`, and [relative link](/notes/).\n", { flag: 'wx' });
  created.push(published);
  await writeFile(draft, "---\ntitle: Private draft fixture\ndescription: Must not be exported.\npublishedOn: '2026-11-18'\ndraft: true\n---\n\nDRAFT_SENTINEL\n", { flag: 'wx' });
  created.push(draft);
  build();
  server = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--local', '--port', '4338'], { stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { await request('/'); ready = true; break; } catch { await new Promise((resolve) => setTimeout(resolve, 250)); }
  }
  assert.ok(ready, 'Wrangler started');
  for (const path of ['/', '/notes/', '/notes/agent-readability-test/']) {
    const markdown = await request(path);
    assert.equal(markdown.status, 200);
    assert.match(markdown.headers.get('content-type'), /^text\/markdown/);
    assert.match(markdown.headers.get('vary'), /Accept/);
    assert.match(markdown.headers.get('link'), /sitemap-index.xml/);
    assert.match(markdown.headers.get('cache-control'), /no-cache/);
    const body = await markdown.text();
    assert.ok(!body.includes('DRAFT_SENTINEL'));
    assert.ok(!body.includes('<!DOCTYPE'));
    const html = await request(path, 'text/html');
    assert.match(html.headers.get('content-type'), /^text\/html/);
    assert.notEqual(html.headers.get('etag'), markdown.headers.get('etag'));
    const head = await request(path, 'text/markdown', { method: 'HEAD' });
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('etag'), markdown.headers.get('etag'));
    assert.equal((await request(path, 'text/markdown', { headers: { 'If-None-Match': markdown.headers.get('etag') } })).status, 304);
    assert.equal((await request(path, 'text/html', { headers: { 'If-None-Match': markdown.headers.get('etag') } })).status, 200);
    for (const accept of ['*/*', 'text/markdown;q=0', 'text/markdown,text/html', 'text/markdown;q=0.2,text/html;q=0.8']) {
      assert.match((await request(path, accept)).headers.get('content-type'), /^text\/html/);
    }
  }
  const text = await (await request('/notes/agent-readability-test/')).text();
  assert.match(text, /\*\*bold\*\*/);
  assert.match(text, /https:\/\/ankeeth.com\/notes\//);
  for (const path of ['/notes/agent-readability-draft/', '/notes/not-a-note/', '/nonexistent/']) assert.equal((await request(path)).status, 404);
  const redirect = await request('/notes?example=1');
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get('location'), '/notes/?example=1');
  assert.match((await request('/favicon-32.png')).headers.get('content-type'), /^image\/png/);
  const direct = await request('/markdown/index.md');
  assert.equal(direct.status, 200);
  assert.equal(direct.headers.get('x-robots-tag'), 'noindex');
  const routes = JSON.parse(await readFile('.generated/markdown-routes.json', 'utf8'));
  assert.deepEqual(Object.keys(routes).sort(), ['/', '/notes/', '/notes/agent-readability-test/']);
  const api = await (await request('/api/notes.json')).json();
  assert.equal(api.version, 1);
  assert.equal(api.notes.length, 1);
  assert.equal(api.notes[0].id, 'agent-readability-test');
  assert.equal(api.notes[0].url, 'https://ankeeth.com/notes/agent-readability-test/');
  assert.equal(api.notes[0].markdownUrl, 'https://ankeeth.com/markdown/notes/agent-readability-test/index.md');
  for (const [path, mime] of [
    ['/.well-known/api-catalog', 'application/linkset+json'],
    ['/api/openapi.json', 'application/vnd.oai.openapi+json'],
    ['/.well-known/agent-skills/index.json', 'application/json'],
    ['/.well-known/agent-skills/read-ankeeth-portfolio/SKILL.md', 'text/markdown'],
    ['/api/README.md', 'text/markdown'],
  ]) {
    const result = await request(path);
    assert.equal(result.status, 200, path);
    assert.ok(result.headers.get('content-type').startsWith(mime), path);
    assert.equal((await request(path, '*/*', { method: 'HEAD' })).status, 200, path);
  }
  const catalog = await (await request('/.well-known/api-catalog')).json();
  assert.equal(catalog.linkset[0].item[0].href, 'https://ankeeth.com/api/notes.json');
  assert.match((await request('/.well-known/api-catalog', '*/*', { method: 'HEAD' })).headers.get('link'), /rel="api-catalog"/);
  const discovery = await (await request('/.well-known/agent-skills/index.json')).json();
  const artifact = await (await request('/.well-known/agent-skills/read-ankeeth-portfolio/SKILL.md')).text();
  assert.equal(discovery.skills[0].digest, 'sha256:' + createHash('sha256').update(artifact).digest('hex'));
  assert.equal(discovery.skills[0].type, 'skill-md');
  assert.ok(!JSON.stringify(api).includes('DRAFT_SENTINEL'));
  console.log('Static API/catalog/skill HTTP checks passed, including dot-directory routes and digest.');
  console.log('Wrangler integration passed: public/draft routes, Markdown, HTML q-values, HEAD, ETags, redirects, assets and 404s.');
} finally {
  server?.kill('SIGTERM');
  for (const file of created) await rm(file, { force: true });
  build();
  const empty = JSON.parse(await readFile('dist/api/notes.json', 'utf8'));
  assert.deepEqual(empty, { version: 1, notes: [] });
}
