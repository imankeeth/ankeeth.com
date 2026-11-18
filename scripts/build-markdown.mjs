import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';

const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
converter.keep(['table']);
const routes = {};
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (entry.name !== 'index.html') continue;
    const path = '/' + relative('dist', directory).split('/').filter(Boolean).join('/');
    const route = path === '/' ? '/' : path + '/';
    if (route !== '/' && !route.startsWith('/notes/')) continue;
    const { document } = parseHTML(await readFile(file, 'utf8'));
    if (document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex')) continue;
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const main = document.querySelector('main');
    if (!main || !canonical) throw new Error(`Missing public page metadata: ${file}`);
    for (const element of main.querySelectorAll('a[href], img[src]')) {
      const attribute = element.tagName === 'A' ? 'href' : 'src';
      element.setAttribute(attribute, new URL(element.getAttribute(attribute), canonical).href);
    }
    main.querySelectorAll('script,style').forEach((element) => element.remove());
    const destination = route === '/' ? '/markdown/index.md' : '/markdown' + route + 'index.md';
    const text = `Source: ${canonical}\n\n${converter.turndown(main.innerHTML)}\n`;
    await mkdir(join('dist', destination, '..'), { recursive: true });
    await writeFile(join('dist', destination), text);
    routes[route] = destination;
  }
}
await visit('dist');
await mkdir('.generated', { recursive: true });
await writeFile('.generated/markdown-routes.json', JSON.stringify(routes, null, 2) + '\n');
console.log(`Generated ${Object.keys(routes).length} public Markdown alternatives.`);
