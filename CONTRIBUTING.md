# Contributing to ShopLarvo

Thanks for your interest in contributing! Follow these guidelines to keep the codebase clean and consistent.

---

## Getting Started

1. **Fork & clone** the repository.
2. Copy `.env.example` → `.env` and fill in your credentials.
3. Install dependencies:
   ```bash
   npm install          # root (Express backend)
   cd client && npm install  # Vite + React frontend
   ```
4. Start both servers:
   ```bash
   npm run dev           # backend on :5000
   cd client && npm run dev  # frontend on :3000
   ```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<epic>/<short-desc>` | `feat/e2/product-search` |
| Fix | `fix/<short-desc>` | `fix/cart-quantity-overflow` |
| Docs | `docs/<short-desc>` | `docs/api-endpoints` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(shop): add color swatch filter
fix(auth): prevent duplicate email registration
docs(readme): update deployment steps
```

---

## Code Standards

- **Backend**: CommonJS (`require`), Express 4 patterns.
- **Frontend**: React 18 functional components, Context API for state.
- **Styling**: TailwindCSS utility classes — avoid inline `style` objects.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components.
- **Validation**: Validate all user input on the server side before processing.
- **Secrets**: Never commit `.env` — use `.env.example` for templates.

---

## Pull Request Checklist

- [ ] Code runs locally without errors (`npm run dev` on both server and client).
- [ ] No hardcoded secrets or API keys.
- [ ] Meaningful commit messages following Conventional Commits.
- [ ] Updated relevant documentation if behavior changed.
- [ ] Tested the affected epic/feature manually.

---

## Project Epics

| Epic | Scope |
|------|-------|
| **E1** | Customer Management — Auth, Profile, Addresses |
| **E2** | Product & Inventory — Catalog, Stock, Categories |
| **E3** | Shopping & Orders — Cart, Checkout, Order Tracking |
| **E4** | Admin & Reports — Dashboard, Analytics, Staff Management |

When working on a feature, identify which epic it belongs to and keep code organized under the appropriate `epics/` subdirectory.
