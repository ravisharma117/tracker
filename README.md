# tracker.naxits

A private project/TODO tracker — Vite + React + shadcn/ui, same stack as
`admin.naxits`. Its own deployment, but it shares the `api/` Netlify Functions
backend and MongoDB database with `admin.naxits`, `naxits` and `imravithedev`
(new collections, `trackerProjects`/`trackerTasks`, unrelated to the portfolio
ones). See `api/README.md`'s "tracker endpoints" section for the route table.

Unlocked with the same `MANAGE_PASSWORD` as admin.naxits — see
`src/lib/managePassword.ts`. Every route on this app's backend is
password-gated, GET included: there is no public page that reads this data.

## Local development

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8888 to develop
                           # against `npm run dev` in ../api
npm run dev                # :8082
```

`npm run typecheck` and `npm run lint` are the static gates, same as every
other front-end in this workspace.

## Markdown import/export

`src/lib/markdown.ts` parses/serializes a project + its tasks against a
Notion-page-shaped format (`# Title`, then `Key: value` metadata lines, then a
free-form body that may contain `- [ ]`/`- [x]` lines anywhere) — see that
file's header comment for the exact contract, including what is and isn't
preserved on a round trip. All of it runs in the browser; the API is plain CRUD.
