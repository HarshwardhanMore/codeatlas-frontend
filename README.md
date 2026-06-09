# CodeAtlas Frontend

![Node.js 24](https://img.shields.io/badge/Node.js-24-339933)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000)
![React 19](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)

Next.js application for authentication, repository workflows, API intelligence views, dependency graph, dashboard, settings, and assistant.

## Repository Responsibility

This repository owns the browser application only. It includes:

- App Router pages and layouts.
- Feature views for auth, dashboard, repositories, API catalog/history, dependency graph, settings, and assistant.
- Typed frontend API clients.
- Shared UI primitives, layout components, and feedback states.

Backend APIs, database access, repository scanning, provider OAuth, and OpenRouter calls are owned by the separate `codeatlas-backend` repository.

## Tech Stack

| Category  | Technology                                           |
| --------- | ---------------------------------------------------- |
| Runtime   | Node.js 24, npm 11                                   |
| Framework | Next.js App Router                                   |
| UI        | React 19, Tailwind CSS                               |
| Forms     | react-hook-form, zod                                 |
| Graphs    | React Flow                                           |
| Icons     | lucide-react                                         |
| Testing   | Vitest, Testing Library, jsdom                       |
| Quality   | ESLint, Prettier, Husky, lint-staged, GitHub Actions |

## UI Capabilities

- Login and registration screens.
- Dashboard overview.
- Repository list, connection, detail, and source management views.
- GitHub and Bitbucket connection entry points.
- ZIP upload UI.
- Scan status and scan history views.
- API catalog, API detail, and API history views.
- Dependency graph visualization.
- Assistant chat workspace.
- Settings workspace.

## Application Structure

```text
src/app/          Next.js App Router pages and route-level composition.
src/features/     Domain-specific UI and behavior.
src/components/   Shared UI, layout, and feedback components.
src/services/     Typed API clients for backend communication.
src/types/        Shared frontend TypeScript types.
src/styles/       Global styles and Tailwind setup.
src/utils/        Small shared helpers.
```

## Requirements

- Node.js `>=24 <25`
- npm `>=11`
- Running CodeAtlas backend API

Use the project Node version:

```bash
nvm use
```

## Environment Setup

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the backend origin:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Do not append `/api/v1`; frontend services add API paths internally.

For more detail, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## Installation

```bash
npm install
```

## Run

Development:

```bash
npm run dev
```

Default local frontend URL:

```text
http://localhost:3000
```

The backend should be running at the origin configured in `NEXT_PUBLIC_API_URL`.

Production-style local run:

```bash
npm run build
npm run start
```

## Build, Test, and Quality

```bash
npm run build
npm run typecheck
npm test
npm run lint
npm run format:check
```

GitHub Actions runs install, lint, typecheck, and build. Husky and lint-staged run fast staged-file checks before commits.

## Common Scripts

| Script                 | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.           |
| `npm run build`        | Build the production application.               |
| `npm run start`        | Start the production Next.js server.            |
| `npm run lint`         | Run ESLint with zero warnings allowed.          |
| `npm run lint:fix`     | Fix supported ESLint issues.                    |
| `npm run format`       | Format files with Prettier.                     |
| `npm run format:check` | Check Prettier formatting.                      |
| `npm run typecheck`    | Generate route types and run TypeScript checks. |
| `npm test`             | Run Vitest tests.                               |

## Troubleshooting

| Issue                              | Likely cause                                                      | Fix                                                                              |
| ---------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| API requests fail                  | Backend is not running or `NEXT_PUBLIC_API_URL` is wrong.         | Start the backend and verify `.env.local`.                                       |
| API paths include `/api/v1/api/v1` | `NEXT_PUBLIC_API_URL` includes `/api/v1`.                         | Set it to the backend origin only.                                               |
| Browser CORS errors                | Backend `FRONTEND_ORIGIN` does not match the frontend origin.     | Update backend `.env` and restart the backend.                                   |
| Google login redirect mismatch     | Backend Google callback URL does not match Google Cloud settings. | Fix backend OAuth configuration.                                                 |
| Session refresh fails              | Refresh cookie is blocked or backend auth config is wrong.        | Check backend origin, frontend origin, HTTPS in production, and cookie settings. |
| Provider connect errors            | GitHub or Bitbucket backend variables are missing.                | Configure provider variables in the backend environment.                         |
| Assistant errors                   | OpenRouter is not configured or failed in the backend.            | Configure `OPENROUTER_API_KEY` in the backend and check backend logs.            |

## Notes for Contributors

- Keep backend calls in `src/services`.
- Keep domain-specific UI in `src/features`.
- Reuse shared feedback components for loading, error, and empty states.
- Do not put backend secrets in frontend environment variables.
- Add or update component tests for meaningful UI behavior changes.
- Keep UI copy concise and user-actionable.
