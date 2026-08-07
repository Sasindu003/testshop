# ShopLarvo — Project-Scoped Agent Rules

## Project Context
- **Type**: Full-stack e-commerce (fashion/clothing)
- **Backend**: Express 4 (CommonJS) + MongoDB Atlas (Mongoose)
- **Frontend**: React 18 + Vite 5 + TailwindCSS 3 + Lucide Icons + Context API
- **Deployment**: Vercel serverless functions
- **Epics**: E1 (Auth), E2 (Products), E3 (Shopping/Orders), E4 (Admin)

## Code Patterns

### Backend
- Routes in `routes/`, controllers in `controllers/`, models in `models/`
- JWT auth via `middleware/authMiddleware.js` — `protect` middleware extracts `req.user`
- Role checks via `middleware/roleMiddleware.js`
- Centralized error handler: `middleware/errorMiddleware.js`
- DB config: `config/db.js` (Mongoose)

### Frontend
- State via Context API: `AuthContext` (user/token), `CartContext` (cart/wishlist/department)
- Both contexts persist to `localStorage` and hydrate on load
- API calls in `client/src/api/` — plain `fetch()` wrappers, no Axios
- Epic-based feature organization: `client/src/epics/E1_*/`, `E2_*/`, etc.
- Pages are route-level views in `client/src/pages/`
- Shop filtering is client-side only against `mockCatalog` array

### Naming
- Components: PascalCase (`ProductQuickViewModal.js`)
- Utilities/API: camelCase (`authApi.js`, `productApi.js`)
- CSS: Tailwind utilities — no separate CSS modules per component

## Important Notes
- The `mockCatalog` in `Shop.js` is hardcoded — not fetched from API yet
- JWT secret has a hardcoded fallback in `authMiddleware.js` — always set `JWT_SECRET` env var
- MongoDB connection gracefully degrades (warns, doesn't crash) when unavailable
