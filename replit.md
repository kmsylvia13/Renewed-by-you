# Renewed By You

A mobile-first college clothing rental and swapping prototype. Students can browse campus closet listings, arrange demo rentals or swaps, manage rentals, and share their own pieces.

## Run & Operate

- `pnpm --filter @workspace/renewed-by-you run dev` — run the Expo app preview
- `pnpm --filter @workspace/renewed-by-you run typecheck` — typecheck the mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

The mobile app is a local-first class MVP. Account details, listings, rental confirmations, swap requests, and extension requests use AsyncStorage; no database, payment provider, or external service is required.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 57, Expo Router, React Native
- Local persistence: AsyncStorage
- Icons: Expo Vector Icons
- Fonts: Inter

## Where things live

- `artifacts/renewed-by-you/app/` — welcome, discovery, listing, rental, and profile screens
- `artifacts/renewed-by-you/data/catalog.ts` — sample clothing data and shared types
- `artifacts/renewed-by-you/state/AppStore.tsx` — app state and local persistence
- `artifacts/renewed-by-you/constants/colors.ts` — mobile color tokens
- `artifacts/renewed-by-you/assets/images/` — generated demo clothing photos and app icon

## Architecture decisions

- Keep this MVP frontend-only; use local device storage for demo data and account state.
- Checkout confirms a demo rental only and must not collect payment details or charge a user.
- Swap and rental requests are prototype records stored on the device, not messages sent to another user.

## Product

Renewed By You helps college students share clothing locally instead of buying a new outfit for every occasion. The prototype includes sample apparel, date-based rental totals, swap requests, rental-extension requests, and user-created clothing listings.

## User preferences

- Keep the visual design modern, cute, minimal, and mobile-friendly, with soft pastels and a clean layout.
- Focus on functional class-MVP behavior rather than commercial payments or backend infrastructure.

## Gotchas

- Keep the sample catalog images in the Expo asset bundle so the demo does not depend on external image URLs.
- Persist all user-created demo activity through the app store rather than screen-local state.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
