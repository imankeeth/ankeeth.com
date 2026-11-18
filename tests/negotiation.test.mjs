import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wantsMarkdown } from '../worker/negotiation.mjs';
for (const accept of ['', '*/*', 'text/*', 'text/html', 'text/markdown;q=0', 'text/markdown;q=0.5,text/html', 'text/markdown,text/html', 'text/markdown,*/*', 'text/markdown;q=garbage']) {
  test(`HTML default: ${accept}`, () => assert.equal(wantsMarkdown(accept), false));
}
for (const accept of ['text/markdown', 'text/markdown;q=1,text/html;q=0.5', 'text/markdown,text/html;q=0,*/*']) {
  test(`explicit Markdown: ${accept}`, () => assert.equal(wantsMarkdown(accept), true));
}
