# Smart WMS — Backend

NestJS API for the Smart Warehouse Management System.

Project-wide setup, architecture, database design, and API spec live in the
root of the repo — see [`/README.md`](../../README.md) and [`/docs`](../../docs).

## Commands (run from repo root)

```bash
npm run backend          # start in watch mode
npm run --workspace=backend seed   # seed the database
npm run --workspace=backend test   # unit tests
npm run --workspace=backend test:e2e
```

Swagger docs are served at `http://localhost:3000/api-docs` once the server is running.
