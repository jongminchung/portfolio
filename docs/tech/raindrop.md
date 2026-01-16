# Raindrop Integration

Raindrop is a cloud bookmark manager with a REST API. This project uses it to
power the public Bookmarks pages by fetching collections and saved links from
Raindrop's API.

## What it does in this project

- The Bookmarks pages are backed by Raindrop data.
- The server fetches collections and bookmarks using an access token.
- If the token is missing, the feature is treated as unavailable.

## API usage

- Base URL: https://api.raindrop.io/rest/v1
- Auth: Bearer token via `RAINDROP_ACCESS_TOKEN`

## Code locations

- API wrapper: `apps/web/src/lib/raindrop.ts`
- Routes: `apps/web/src/routes/(public)/bookmarks/index.tsx`
- Route: `apps/web/src/routes/(public)/bookmarks/$bookmarkId.tsx`
- UI: `apps/web/src/components/bookmarks`

## Environment variables

- `RAINDROP_ACCESS_TOKEN`
  - Required to fetch collections and bookmarks.
  - If missing, the feature is disabled and a warning is logged.
