# CodeAtlas Frontend Context

This file explains what exists in the `codeatlas-frontend` repository, why it exists, and how it works. `AGENTS.md` explains how contributors must work; this file explains frontend implementation reality.

Last verified against the local frontend codebase on 2026-06-09.

## Product Role

CodeAtlas is an AI-powered engineering intelligence platform. The frontend is the browser application that lets users authenticate, connect repositories, run scans, inspect API intelligence, view dependency graphs, review changes, and use the assistant.

The frontend does not scan repositories, access the database, call OpenRouter directly, perform provider OAuth token exchange, or own backend business rules. Those responsibilities belong to the separate `codeatlas-backend` repository.

## Runtime and Stack

- Node.js 24 with npm 11.
- Next.js App Router.
- React 19 and TypeScript.
- Tailwind CSS.
- React Flow for dependency graph visualization.
- react-hook-form and zod for forms.
- lucide-react for icons.
- Vitest, Testing Library, and jsdom for tests.
- ESLint, Prettier, Husky, lint-staged, and GitHub Actions for quality.

## Frontend Responsibilities

Implemented frontend responsibilities:

- Login and registration screens.
- Google login entry point.
- Auth provider, access-token storage, refresh flow, logout, and protected route foundation.
- Dashboard overview from backend analytics data.
- Repository list, connect, import, upload, detail, scan, and scan history UI.
- GitHub and Bitbucket connection entry points.
- ZIP upload UI.
- API catalog with search/filter/pagination support.
- API detail and schema viewing.
- API history and change timeline UI.
- Dependency graph visualization using React Flow and backend graph data.
- AI assistant chat workspace and conversation history.
- Settings workspace for profile/security/provider/repository links.
- Loading, error, and empty states for product workspaces.

Not owned here:

- Backend API implementation.
- Database schema or migrations.
- OAuth provider secret handling.
- Repository materialization/scanning.
- AI provider calls and prompt/context construction.

## Application Flow

Typical user flow:

```text
Login/register
  -> Dashboard or repositories
  -> Connect provider or upload ZIP
  -> Open repository detail
  -> Start scan
  -> Review APIs, history, changes, dependency graph
  -> Ask assistant questions
```

The frontend receives backend data and renders it. It must not fabricate repositories, scans, APIs, graph nodes, metrics, or AI messages.

## Routing

Implemented App Router pages:

- `/`: authenticated entry/landing composition.
- `/login`: login screen.
- `/register`: registration screen.
- `/dashboard`: analytics overview.
- `/repositories`: repository list.
- `/repositories/connect`: repository source connection and upload.
- `/repositories/detail`: repository detail and scan controls.
- `/repositories/apis`: repository API catalog.
- `/repositories/dependencies`: dependency graph.
- `/apis/detail`: API detail view.
- `/apis/history`: API history and changes.
- `/assistant`: assistant workspace.
- `/settings`: profile, security, providers, and repository management.
- `/error`: application error boundary UI.

## Folder Structure

- `src/app`: route files and page-level composition.
- `src/components/ui`: reusable primitive UI.
- `src/components/layout`: application shell and navigation.
- `src/components/feedback`: reusable loading, error, and empty states.
- `src/features/auth`: auth provider, forms, auth page, protected route.
- `src/features/dashboard`: dashboard workspace.
- `src/features/repositories`: repository workflows, scans, API catalog/history, dependency graph.
- `src/features/assistant`: assistant workspace and message rendering.
- `src/features/settings`: settings workspace.
- `src/services`: backend API clients and token storage.
- `src/types`: frontend domain/API types.
- `src/styles`: global CSS.
- `src/utils`: shared helpers.

## API Communication

All backend communication goes through `src/services`.

Implemented service areas:

- `auth`: register, login, refresh, logout, current user, Google OAuth URL.
- `repositories`: provider connections, repository list/import/upload, scans, APIs, changes, dependency graph.
- `dashboard`: dashboard metrics.
- `ai`: conversations and repository chat.

`NEXT_PUBLIC_API_URL` is the only frontend environment variable. It must be the backend origin only, for example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Services append `/api/v1/...` paths internally. Do not include `/api/v1` in the environment value.

## Auth UX

Auth flow:

1. User registers, logs in, or starts Google login.
2. Backend returns access token and manages refresh cookie.
3. Frontend stores the access token through `tokenStorage`.
4. `AuthProvider` loads and refreshes current session state.
5. Protected product pages require authenticated state.

The frontend does not store JWT signing secrets or OAuth secrets. It only stores the access token needed for API authorization.

## Repository UX

Repository UI supports:

- Provider status and connect/disconnect entry points.
- GitHub and Bitbucket provider repository listing/import flows.
- ZIP upload.
- Repository listing.
- Repository detail.
- Scan creation, cancellation, status polling, and history display.

Provider setup errors are displayed as actionable backend-configuration messages when provider credentials are missing.

## Dashboard UX

The dashboard displays real backend analytics only:

- Repository overview.
- Scan status summary.
- API intelligence summary.
- Risk overview.
- Recent activity.

Empty and error states explain what is missing or what failed.

## Scanner Status UX

Repository detail surfaces scan state from backend APIs:

- Queued.
- Running.
- Progress percentage/stage/message.
- Completed.
- Failed.
- Cancelled.

The frontend polls backend scan status rather than opening a WebSocket.

## API Catalog and History UX

API views use detected backend records:

- API catalog table.
- Search and filters.
- Method badges.
- API detail.
- Request/response schema viewer.
- API history and snapshot timeline.
- API change timeline with severity/risk information.

The UI must not create fake API records or guessed schemas.

## Dependency Graph UX

The dependency graph page renders backend dependency graph data with React Flow. Nodes and edges must come from persisted backend `CodeDependency` data exposed by the backend service.

The frontend may transform graph data for presentation, but it must not invent graph relationships.

## AI Assistant UX

The assistant page provides:

- Repository selection.
- Chat interface.
- Conversation history.
- Markdown-like message rendering.
- Loading and error states.

The frontend calls backend AI endpoints. It does not call OpenRouter directly and does not read repository files.

## Settings UX

Settings includes profile/security information, connected provider status, and repository management links. It does not implement billing.

## State Handling

- Feature components own local UI state for loading, errors, selected filters, pagination, and form state.
- `AuthProvider` owns auth/session state.
- API clients are stateless service wrappers.
- No external global state library is currently used.

## Error and Empty State Pattern

User-facing async flows should show:

- Loading state while data is being requested.
- Error state when the request fails, with a recovery action where practical.
- Empty state when data exists but has no records, with the next action.

Do not hide backend errors behind generic UI unless the backend message is unsafe to show.

## Design Principles

- Professional, minimal SaaS UI.
- Clear information hierarchy.
- Responsive layouts.
- Accessible forms and controls.
- Reusable layout and feedback components.
- No fake data, screenshots, stats, or marketing-only content.

## Deployment

Required frontend environment:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

Deployment notes:

- Set `NEXT_PUBLIC_API_URL` in the hosting platform before `next build`.
- Production frontend origin must match backend `FRONTEND_ORIGIN`.
- HTTPS is required in production for backend secure cookies to work.
- Backend provider and AI secrets are never configured in the frontend.

## Testing Approach

Test coverage exists for auth forms, assistant messages, dashboard workspace, repository provider cards, scan status, API method/risk badges, schema viewer, API catalog, API change timeline, dependency graph workspace, and settings workspace.

Run:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Tests should mock frontend service calls and verify visible behavior rather than backend internals.

## Current Limitations

- The frontend depends on a running backend for real product data.
- Provider OAuth, scanning, API discovery, and AI failures are surfaced from backend responses.
- There is no frontend-owned database or offline data source.
