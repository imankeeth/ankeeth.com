# ankeeth.com

Ankeeth Suvarna’s personal site. Astro builds static HTML, CSS and assets into
`dist/`; a small Worker negotiates Markdown for public pages. No CMS or client-side framework is needed.

## Production source

Cloudflare builds production from `main` in `imankeeth/ankeeth.com`. The legacy
`.com` portfolio is preserved on `master`. The old `imankeeth/ankeeth.dev`
repository remains untouched and is no longer a deployment source.

## Run locally

Use Node 24 (see `.node-version`) and pnpm 11 (see `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
pnpm preview
```

Use `pnpm dev` while editing. The old site’s content is still in Git history
(`59ad7ea`); it’s not included in this build.

## Publish a note

Create `src/content/notes/my-first-note.md`:

```markdown
---
title: My first note
description: A short, specific summary for search and feed readers.
publishedOn: '2026-11-18'
---

Start writing here. Use level-two headings (`##`) within the note.
```

Use a lowercase, hyphen-separated filename and keep it stable after publishing:
it becomes `/notes/my-first-note/`. Include alt text on meaningful images
and use descriptive link text. Set `draft: true` to exclude an unfinished note
from all public output, including its article URL, sitemap and feed. Draft files
remain visible to anyone with repository access, so don’t commit sensitive content. The homepage displays the five most recent published notes; the
archive displays them all. Push a feature branch and open a pull request.
`main` requires a PR (no separate approval required); merging the PR triggers
the Cloudflare production build. A branch push or draft PR does not publish production.

Each published note automatically gets a 1200×630 share image generated at build
time from its title and description. No extra frontmatter or image-making step is
needed. Long text is shortened on the card only. Drafts generate neither public
pages nor cards. Editing the title or description changes the card URL so share
previews can refresh; platforms may still cache the page metadata. The homepage
uses its own portrait card with “Let’s connect”; the archive retains the original
portrait card. Rendering tools and fonts stay in
the build environment, not the deployed static site.

## Deploy to Cloudflare Workers

1. In **Workers & Pages**, import this GitHub repository into a Worker. Set
   the production branch to `main` and the root to the repository root.
2. Set Node to 24 (the repository also includes `.node-version`). Use
   `pnpm build` as the build command and `pnpm exec wrangler deploy` as the deploy
   command. The checked-in Wrangler config names the Worker `ankeeth-dev` and
   serves `dist/` as static assets plus the checked-in negotiation Worker. Preview branches can be enabled separately.
3. Test the Worker preview, including `/notes/`, `/rss.xml`, `/sitemap-index.xml`
   and an unknown URL (HTTP 404). After the `ankeeth.com` zone is active in
   Cloudflare, add `ankeeth.com` as the Worker’s **Custom Domain**. Verify HTTPS
   on the custom domain before switching the old domain. If migrating DNS, copy
   any existing mail and verification records before changing nameservers.

[Astro on Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) ·
[Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

## Redirect ankeeth.dev

In the **ankeeth.dev** Cloudflare zone, after the new HTTPS site is working, make
sure `@` and `www` have proxied DNS records. If they're redirect-only and have
no origin, Cloudflare documents a proxied A record with address `192.0.2.1`.
Keep unrelated records such as MX and TXT. Create a **Single Redirect**:

- Match: `(http.host eq "ankeeth.dev") or (http.host eq "www.ankeeth.dev")`
- Dynamic target: `concat("https://ankeeth.com", http.request.uri.path)`
- Status: **301**; **Preserve query string**: enabled.

Test with `curl -I 'https://ankeeth.dev/notes/?ref=redirect-test'`. Expect
`Location: https://ankeeth.com/notes/?ref=redirect-test`. Also check
`https://www.ankeeth.dev/`. Only redirect hosts that are yours.

[Cloudflare redirect guide](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/)

## Machine-readable pages

`pnpm build` converts the rendered public `<main>` HTML into Markdown under
`dist/markdown/`. Home, the Notes archive and published notes use the same content
as their HTML pages. Drafts and noindex pages are excluded; no author steps or
duplicated copy are required. A build-only converter preserves tables as HTML
inside Markdown and resolves links/images against each page’s canonical URL.

GET/HEAD requests explicitly preferring `text/markdown` receive Markdown; HTML
remains the default for wildcards and equal/higher HTML quality. Responses include
`Vary: Accept`, representation-specific ETags and `Cache-Control: no-cache` to
require revalidation. Link headers advertise the existing sitemap index, RSS and
the direct Markdown alternative. Static asset handling retains slash redirects
and real 404s. The direct Markdown URLs are marked noindex to avoid duplicate
search results. robots.txt and AI usage preferences are unchanged.

The Worker runs only for `/`, `/notes` and `/notes/*`, including browser HTML
requests on those routes. Those invocations consume the account’s Workers quota;
static assets elsewhere do not invoke it. This adds a free-tier quota dependency
that the previous all-static site did not have. No paid Markdown feature is used.
Review account limits before merging; this PR does not change a plan or dashboard
setting. Local end-to-end testing uses `pnpm build` then
`pnpm exec wrangler dev --local --port 4337`. `pnpm preview` previews static HTML
only, not content negotiation. Run `pnpm test:markdown` for the local Worker
integration suite; its temporary published/draft fixtures are removed afterward.
