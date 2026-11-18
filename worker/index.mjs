import routes from '../.generated/markdown-routes.json';
import { wantsMarkdown } from './negotiation.mjs';

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);
    // Resolve canonical redirects/404s through the existing static asset handler first.
    // Conditional validators must be evaluated against the selected representation.
    const headers = new Headers(request.headers);
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
    const cleanRequest = new Request(request, { headers });
    let response = await env.ASSETS.fetch(cleanRequest);
    const alternate = routes[new URL(request.url).pathname];
    if (response.status !== 200 || !alternate) return response;
    if (wantsMarkdown(request.headers.get('Accept') ?? '')) {
      const url = new URL(request.url);
      url.pathname = alternate;
      response = await env.ASSETS.fetch(new Request(url, cleanRequest));
      if (response.status !== 200) return response;
    }
    const resultHeaders = new Headers(response.headers);
    // The alternate asset is noindex at its direct URL, not at the canonical page.
    resultHeaders.delete('X-Robots-Tag');
    resultHeaders.set('Vary', [...new Set((resultHeaders.get('Vary') ?? '').split(',').map((value) => value.trim()).filter(Boolean).concat('Accept'))].join(', '));
    resultHeaders.set('Cache-Control', 'no-cache');
    resultHeaders.set('Link', `<https://ankeeth.com/.well-known/ard.json>; rel="ard"; type="application/json", <https://ankeeth.com/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", <https://ankeeth.com/sitemap-index.xml>; rel="sitemap"; type="application/xml", <https://ankeeth.com/rss.xml>; rel="alternate"; type="application/rss+xml", <https://ankeeth.com${alternate}>; rel="alternate"; type="text/markdown"`);
    const etag = resultHeaders.get('ETag');
    const matches = request.headers.get('If-None-Match')?.split(',').map((tag) => tag.trim().replace(/^W\//, ''));
    if (etag && (matches?.includes(etag.replace(/^W\//, '')) || matches?.includes('*'))) {
      return new Response(null, { status: 304, headers: resultHeaders });
    }
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers: resultHeaders });
  },
};
