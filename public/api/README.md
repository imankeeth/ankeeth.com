# Public notes index

GET https://ankeeth.com/api/notes.json returns a build-time JSON snapshot:
`{"version":1,"notes":[]}` when no notes are published.

Each note has `id`, `title`, `description`, `publishedOn` (YYYY-MM-DD), `url`
(canonical HTML) and `markdownUrl` (plain Markdown). Notes are sorted by date
newest first, with ID ascending as the tie-break. Drafts are excluded. No query
parameters or pagination are supported; all published metadata is returned.
The snapshot changes when a new site build is deployed.

Use the returned Markdown URL to read an article, and cite its canonical URL.
GET and HEAD are public; no authentication or credentials are needed. This API
has no write operations. See [OpenAPI](https://ankeeth.com/api/openapi.json)
and the [catalog](https://ankeeth.com/.well-known/api-catalog).
