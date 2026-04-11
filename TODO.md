# Nursery App TODO

## Current Status
- Backend + frontend exist (LocalLeaf Nursery Ordering System).
- Backend uses **MySQL** via `models/db.js`.

## Fixed / Improved
- `routes/orderRoutes.js`: owner endpoints protected with auth/role middleware.
- `controllers/orderController.js`: includes nursery lookup for owner order listing.
- `frontend/src/App.jsx`: plants state now matches backend response shape.
- `frontend/src/api.js`: adds `resolveApiUrl()` so image URLs work reliably.

## Database Setup (MySQL)
1. Set `.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).
2. Run `npm run db:init` (imports `schema.sql`).
3. Run `npm run db:check` (prints tables).
4. Start backend: `npm run dev` (stable) or `npm run dev:nodemon` (auto-reload)
5. Start frontend: `npm run client:dev`

## Next Checks
- Register an owner, then hit `/api/nursery/subscribe` from the UI to activate subscription.
- Add plants (owner) and request plants (customer), then verify orders in dashboard.
