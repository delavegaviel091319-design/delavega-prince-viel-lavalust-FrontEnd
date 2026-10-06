# Product Management - React frontend

Frontend for **Laboratory Exercise No. 6** (React + Vite + Axios). Dark-purple UI with:
Login / Register -> Product list -> Add / Edit / Delete -> Logout.

The app talks **only** to the LavaLust API (it never connects to the database).
Tokens (JWT) are kept in `localStorage` and sent as `Authorization: Bearer ...`;
an expired access token is refreshed automatically once before logging the user out.

## Run locally
```bash
npm install
cp .env.example .env         # set VITE_API_URL (default http://localhost:3000)
npm run dev                  # http://localhost:5173
```
Start the API first (`php lava serve --port=3000` in `lavalust-api`).

## Build for production
```bash
npm run build                # output in dist/
```

## Deploy to Render (Static Site)
| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment variable | `VITE_API_URL` = your Render API URL (no trailing slash) |

Then add the frontend URL to `CORS_ORIGIN` on the API service.
(`VITE_API_URL` is baked in at build time - redeploy after changing it.)

## Structure
```
src/
  api.js                axios instance, token handling, all API calls
  App.jsx               shows Login or Products depending on the session
  pages/Login.jsx       login + register
  pages/Products.jsx    list, search, add/edit/delete flows
  components/ProductForm.jsx
  styles.css            dark purple theme
```
