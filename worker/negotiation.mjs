// A wildcard never opts a browser into Markdown; ties prefer HTML.
export function wantsMarkdown(accept = '') {
  let markdown = 0;
  let html = 0;
  let htmlSpecificity = -1;
  for (const part of accept.toLowerCase().split(',')) {
    const [type, ...parameters] = part.trim().split(';');
    const parameter = parameters.map((value) => value.trim()).find((value) => value.startsWith('q='));
    const quality = parameter ? Number(parameter.slice(2)) : 1;
    const q = Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0;
    if (type === 'text/markdown') markdown = Math.max(markdown, q);
    const specificity = type === 'text/html' ? 2 : type === 'text/*' ? 1 : type === '*/*' ? 0 : -1;
    if (specificity > htmlSpecificity) { htmlSpecificity = specificity; html = q; }
    else if (specificity >= 0 && specificity === htmlSpecificity) html = Math.max(html, q);
  }
  return markdown > 0 && markdown > html;
}
