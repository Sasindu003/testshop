# ShopLarvo — Deployment Guide

## Platform

- **Hosting**: [Vercel](https://vercel.com)
- **Database**: MongoDB Atlas (or any MongoDB provider)
- **CI/CD**: Every push to `main` triggers an automatic deployment

---

## Vercel Project Setup

1. Import the GitHub repository in the Vercel dashboard
2. Framework Preset: **Other**
3. Root Directory: `.` (monorepo root)
4. Build Command: handled by `vercel.json` (no override needed)
5. Output Directory: handled by `vercel.json` (no override needed)

---

## Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables** for the **Production** environment:

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/shoplarvo` |
| `JWT_SECRET` | ✅ | Access token signing secret (64+ char random) | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing secret (64+ char random) | `openssl rand -hex 32` |
| `CLIENT_URL` | ✅ | Deployed frontend URL (for CORS) | `https://shoplarvo.vercel.app` |
| `NODE_ENV` | ✅ | Must be `production` | `production` |
| `AI_STYLIST_API_KEY` | Phase 5 | API key for AI Stylist feature | _(set when Phase 5 is implemented)_ |

> [!IMPORTANT]
> **`JWT_SECRET` and `JWT_REFRESH_SECRET`** must be different from each other and cryptographically random.
> Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> [!WARNING]
> **`CLIENT_URL`** must match the exact deployed domain (including `https://`). Incorrect values will cause CORS failures on every API call.

---

## Architecture

```
vercel.json routes:

  /api/*  →  server.js (Vercel Serverless Function)
  /*      →  client/dist/index.html (Vite SPA, deep-link safe)
```

- `server.js` is deployed as a single serverless function handling all `/api/*` routes
- `client/` is built via `@vercel/static-build` and served as static files
- The catch-all `/(.*) → index.html` ensures client-side routing works on refresh

---

## Verification

After deployment, confirm:

```bash
# Health check
curl https://your-domain.vercel.app/api/health
# Expected: {"success":true,"message":"ok"}

# 404 handling
curl https://your-domain.vercel.app/api/nonexistent
# Expected: {"success":false,"message":"Route not found"}
```

---

## Redeployment

- **Automatic**: Push to `main` → Vercel builds and deploys
- **Manual**: Vercel Dashboard → Deployments → Redeploy
- **Environment change**: After updating env vars, trigger a redeployment for changes to take effect
