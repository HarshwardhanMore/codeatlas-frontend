# CodeAtlas Frontend Environment Setup

This guide explains how to configure the CodeAtlas frontend from a fresh clone. It documents only environment variables that exist in the current frontend implementation and `.env.example`.

Last reviewed for provider setup flows: June 2026.

## 1. Prerequisites

| Tool    | Required version | Why it is needed                          |
| ------- | ---------------- | ----------------------------------------- |
| Node.js | `24.x`           | The frontend package requires `>=24 <25`. |
| npm     | `>=11`           | Dependency installation and scripts.      |

Check local versions:

```bash
node --version
npm --version
```

The repository includes `.nvmrc` with Node `24`:

```bash
nvm use
```

Install dependencies:

```bash
cd /home/harsh/Documents/Personal/codeatlas/codeatlas-frontend
npm install
```

## 2. Environment Creation

Create a local frontend environment file:

```bash
cd /home/harsh/Documents/Personal/codeatlas/codeatlas-frontend
cp .env.example .env.local
```

The frontend currently has one implemented environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Use `.env.local` for local development. Do not commit `.env.local`.

## 3. Backend Connection

`NEXT_PUBLIC_API_URL` points the browser application to the CodeAtlas backend origin.

| Environment        | Example                                                 |
| ------------------ | ------------------------------------------------------- |
| Local development  | `NEXT_PUBLIC_API_URL=http://localhost:3001`             |
| Docker local stack | `NEXT_PUBLIC_API_URL=http://localhost:3001`             |
| Production         | `NEXT_PUBLIC_API_URL=https://api.codeatlas.example.com` |

The frontend service code appends backend API paths such as:

```text
/api/v1/auth
/api/v1/repositories
/api/v1/integrations
/api/v1/ai
```

Do not include `/api/v1` in `NEXT_PUBLIC_API_URL`. Set only the backend origin.

Correct:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Incorrect:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 4. Authentication Configuration

The frontend does not store Google, GitHub, Bitbucket, JWT, Redis, database, or OpenRouter secrets. Those are backend-only settings.

Frontend authentication depends on:

1. `NEXT_PUBLIC_API_URL` pointing to the backend.
2. Backend `FRONTEND_ORIGIN` matching the frontend origin, for example `http://localhost:3000`.
3. Backend CORS allowing credentials.
4. Browser requests using cookies for refresh-token flows.
5. Google OAuth being configured in the backend.

Local URL alignment:

| Component               | Local URL                                           |
| ----------------------- | --------------------------------------------------- |
| Frontend                | `http://localhost:3000`                             |
| Backend                 | `http://localhost:3001`                             |
| Backend Google callback | `http://localhost:3001/api/v1/auth/google/callback` |

When the user clicks **Continue with Google**, the frontend sends the browser to:

```text
{NEXT_PUBLIC_API_URL}/api/v1/auth/google
```

The backend owns the OAuth redirect, state cookie, Google callback, session creation, and redirect back to the frontend.

## 5. Deployment Configuration

### Vercel

1. Open the Vercel project.
2. Go to **Settings > Environment Variables**.
3. Add:

```env
NEXT_PUBLIC_API_URL=https://api.codeatlas.example.com
```

4. Add the value to the correct Vercel environments:
   - Development, if using Vercel development deployments.
   - Preview, if pull request previews should call a preview or staging backend.
   - Production, for the production backend.
5. Redeploy the frontend after changing the variable.

Important:

- Variables prefixed with `NEXT_PUBLIC_` are exposed to browser JavaScript.
- Never put backend secrets in frontend environment variables.
- Preview frontends should not call production backends unless that is intentional.
- Production frontend URL must match the backend `FRONTEND_ORIGIN`.

### Other Hosts

Set `NEXT_PUBLIC_API_URL` in the platform's build/runtime environment before running:

```bash
npm run build
npm run start
```

For static or serverless hosts, ensure the value is available during `next build`.

## 6. Complete Frontend `.env.local` Example

```env
# Backend origin only. Do not append /api/v1.
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Production example:

```env
NEXT_PUBLIC_API_URL=https://api.codeatlas.example.com
```

## 7. Troubleshooting

| Symptom                                              | Likely cause                                                                | Fix                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| API connection failed                                | Backend is not running or `NEXT_PUBLIC_API_URL` points to the wrong origin. | Start the backend on port `3001` or update `.env.local`; restart `npm run dev`.                  |
| Browser requests go to the wrong URL                 | `.env.local` changed after the dev server started.                          | Stop and restart the Next.js dev server.                                                         |
| 404 from auth or repository requests                 | `NEXT_PUBLIC_API_URL` includes `/api/v1`, causing duplicated paths.         | Set `NEXT_PUBLIC_API_URL` to the backend origin only.                                            |
| Login works but refresh/session fails                | Backend refresh cookie is not accepted by the browser.                      | Confirm frontend URL, backend `FRONTEND_ORIGIN`, cookie settings, and same browser/site context. |
| Google OAuth redirect mismatch                       | Backend Google callback URL does not match Google Cloud Console.            | Fix backend `GOOGLE_CALLBACK_URL` and Google authorized redirect URI.                            |
| CORS error in browser console                        | Backend `FRONTEND_ORIGIN` does not match the frontend origin.               | Set backend `FRONTEND_ORIGIN` to the exact frontend URL and restart backend.                     |
| Production auth cookie not set                       | Backend runs with `NODE_ENV=production` but is served over HTTP.            | Use HTTPS for production frontend and backend.                                                   |
| Repository provider connect button shows setup error | Backend provider variables are missing.                                     | Configure GitHub or Bitbucket in `codeatlas-backend/.env`.                                       |
| AI assistant says provider is unavailable            | Backend `OPENROUTER_API_KEY` is missing or OpenRouter failed.               | Configure OpenRouter in backend `.env`; check backend logs.                                      |

## Environment Variable Coverage

The frontend currently supports this environment variable:

```text
NEXT_PUBLIC_API_URL
```
