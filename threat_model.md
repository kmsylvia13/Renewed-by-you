# Threat Model

## Project Overview

"Renewed By You" is a mobile-first college clothing rental/swapping prototype built with Expo (React Native) + Expo Router, inside a pnpm workspace monorepo. The repo contains three artifacts:

- `artifacts/renewed-by-you` — the Expo app. Local-first MVP: all account details, listings, rentals, swaps, and extension requests are stored in device AsyncStorage. No database, payment provider, or external service. It also ships a tiny zero-dependency Node static server (`server/serve.js`) that serves the static web build and an Expo Go landing page in deployment.
- `artifacts/api-server` — an Express + TypeScript skeleton exposing only `GET /api/healthz`. No data access, no auth surface.
- `artifacts/mockup-sandbox` — design/mockup canvas, development-only.

Deployment: `https://renewed-by-you.replit.app` (autoscale, public). TLS is managed by the Replit platform.

## Assets

- **User-created demo data** — listings, rentals, swap/extension requests. Stored only on the user's own device via AsyncStorage; not transmitted to any server, so compromise scope is limited to the local device.
- **No server-side secrets** — there is no database connection string, payment key, or third-party API key in the codebase. No authentication system exists.

## Trust Boundaries

- **Browser/mobile client to static server** — `serve.js` serves static assets and a landing page. It performs no authentication and holds no sensitive data; it only reads files from the static build directory.
- **Browser to api-server** — only `/api/healthz`. No data crosses this boundary beyond a static health status.
- **No authenticated/unauthenticated boundary** — the app has no accounts backed by a server; "account" state is purely local.

## Scan Anchors

- Production entry points:
  - `artifacts/renewed-by-you/server/serve.js` (static file + landing-page server)
  - `artifacts/api-server/src/app.ts`, `src/routes/*` (Express; only `/api/healthz`)
- Highest-risk areas (reviewed, currently safe):
  - `serve.js` `serveStaticFile` — path traversal guarded by `path.normalize` + leading-`..` strip + `startsWith(STATIC_ROOT)` 403 check.
  - `serve.js` `serveLandingPage` — host header reflected into landing page but escaped via `escapeHtml`/`toScriptString`.
- Public surfaces: the static web build and landing page (public, no sensitive data); `/api/healthz` (public, static).
- Dev-only (ignore unless proven reachable): `artifacts/mockup-sandbox`, `.expo/`, generated `dist/` bundles.

## Threat Categories

### Information Disclosure
The static server reads only from the static build directory, with a path-traversal guard that rejects paths resolving outside the root (HTTP 403). The api-server returns only a static health status. No PII, secrets, or broad data queries are exposed server-side. Guarantee to uphold: static file serving MUST remain constrained to the build directory; any future API that returns user data MUST scope results to an authenticated subject.

### Tampering
All business state (rental totals, swap records) is computed and stored client-side in a prototype with no server authority, so there is no server-side integrity boundary to violate today. Guarantee: if this app ever gains a backend, prices/totals and permissions MUST be enforced server-side rather than trusting client-stored values.

### Elevation of Privilege
There are currently no roles, no authentication, and no privileged server actions, so there is no privilege boundary to escalate across. Guarantee: introducing any admin or multi-user server functionality MUST add server-side authorization checks on every sensitive object and action.
