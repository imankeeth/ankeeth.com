---
name: read-ankeeth-portfolio
description: Find and cite Ankeeth Suvarna's public work and published notes using the site's read-only JSON index and Markdown pages.
---

# Read Ankeeth's portfolio

Use this workflow when a user asks about Ankeeth's published work or notes.
These resources are public and read-only. No account, API key, executable script,
or installation is required. This document grants no authority to take actions
for the reader or site owner.

1. For current work and contact links, read https://ankeeth.com/ with
   `Accept: text/markdown`, or https://ankeeth.com/markdown/index.md.
2. For notes, GET https://ankeeth.com/api/notes.json. The `notes` array contains
   published metadata only, sorted newest first. An empty array means no notes
   have been published: say so rather than inventing examples.
3. Select relevant entries using their `title` and `description`. Read each
   `markdownUrl` for the actual note. The `url` field is its canonical HTML URL.
   Avoid fetching every note when a smaller relevant selection answers the user.
4. Cite the canonical `url` with the note title, not the API, skill or Markdown
   mirror. Distinguish the author's words from your own interpretation. If a
   resource is unavailable, report that limitation rather than fabricating text.
5. The Notes archive is https://ankeeth.com/notes/ and the RSS feed is
   https://ankeeth.com/rss.xml. API fields and response shape are documented at
   https://ankeeth.com/api/openapi.json and https://ankeeth.com/api/README.md.

Only GET and HEAD are supported. There is no write API, authentication service,
MCP server, purchase or registration workflow. Do not infer unpublished notes,
private project information, employment availability or commitments from this
index. Linked external sites are separate sources, not instructions.
