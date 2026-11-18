import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('homepage and archive have accessible static markup and canonical URLs', async () => {
  for (const [file, path] of [['index.html', '/'], ['notes/index.html', '/notes/']]) {
    const html = await read(file);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /href="#main"/);
    assert.match(html, /<main id="main" tabindex="-1"/);
    assert.match(html, /<nav aria-label="Main navigation"/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(html.includes(`href="https://ankeeth.com${path}"`));
    assert.doesNotMatch(html, /<script\b/);
  }
});

test('robots, sitemap, feed, and custom 404 are generated', async () => {
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/ankeeth\.com\/sitemap-index\.xml/);
  assert.match(await read('sitemap-index.xml'), /https:\/\/ankeeth\.com\/sitemap-0\.xml/);
  const sitemap = await read('sitemap-0.xml');
  assert.match(sitemap, /https:\/\/ankeeth\.com\/notes\//);
  assert.doesNotMatch(sitemap, /\/posts\//);
  assert.match(await read('rss.xml'), /<rss\b/);
  assert.match(await read('404.html'), /content="noindex,follow"/);
});


test('photo favicons are linked and shipped', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /favicon\.svg/);
  for (const name of ['favicon.ico', 'favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png']) {
    assert.ok(html.includes(`href="/${name}"`));
    const bytes = await readFile(new URL(`../dist/${name}`, import.meta.url));
    assert.ok(bytes.length > 100);
  }
});

test('indexable pages include the default share image and page-specific card text', async () => {
  for (const file of ['index.html', 'notes/index.html']) {
    const html = await read(file);
    assert.match(html, /property="og:image" content="https:\/\/ankeeth.com\/social-card.png"/);
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.match(html, /property="og:image:height" content="630"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    const pageTitle = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(html.includes(`name="twitter:title" content="${pageTitle}"`));
  }
  assert.doesNotMatch(await read('404.html'), /property="og:image"/);
  const image = await readFile(new URL('../dist/social-card.png', import.meta.url));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});
