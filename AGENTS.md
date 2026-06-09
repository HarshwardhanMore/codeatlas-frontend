# CodeAtlas Frontend Contributor Guide

This file is permanent guidance for AI agents and engineers working in the `codeatlas-frontend` repository.

## Repository Role

`codeatlas-frontend` is the Next.js browser application for CodeAtlas. It owns routing, page composition, feature workspaces, UI components, frontend API clients, user-facing state, and loading/error/empty experiences.

This repository does not own backend APIs, database access, repository scanning, provider OAuth implementation, OpenRouter calls, or queue processing. Those belong in the separate `codeatlas-backend` repository.

## Architecture Principles

- Pages compose feature workspaces.
- Features own product-specific UI behavior.
- Services own backend API communication.
- Shared components stay reusable and domain-light.
- Keep UI state close to the feature that owns it.
- Keep environment usage centralized in service clients.
- Use typed request/response shapes from `src/types`.
- Always provide loading, error, and empty states for async product screens.
- Keep copy concise, practical, and action-oriented.

## Locked Frontend Stack

- Runtime: Node.js 24 LTS with npm 11.
- Framework: Next.js App Router.
- Language: TypeScript.
- UI: React 19 and Tailwind CSS.
- Forms: react-hook-form and zod.
- Graphs: React Flow.
- Icons: lucide-react.
- Testing: Vitest, Testing Library, jsdom.
- Quality: ESLint, Prettier, Husky, lint-staged, GitHub Actions.

## Folder Ownership

- `src/app`: App Router pages, route-level layout, and page composition.
- `src/components/ui`: reusable primitive UI components.
- `src/components/layout`: application shell and navigation.
- `src/components/feedback`: shared loading, error, and empty states.
- `src/features/auth`: login, registration, auth provider, protected route behavior.
- `src/features/dashboard`: dashboard overview UI.
- `src/features/repositories`: repository onboarding, repository detail, scans, API catalog, API history, dependency graph.
- `src/features/assistant`: assistant chat workspace and message rendering.
- `src/features/settings`: profile, security, connected providers, and repository management links.
- `src/services`: typed API clients and token storage helpers.
- `src/hooks`: reusable React hooks when needed.
- `src/types`: shared frontend API/domain types.
- `src/styles`: global CSS and Tailwind setup.
- `src/utils`: small pure helpers.

## Next.js and React Rules

- Use App Router pages in `src/app`.
- Keep page files small; delegate screen logic to feature components.
- Do not put backend request logic directly in pages or generic components.
- Prefer controlled, typed feature state over global state unless a shared provider already exists.
- Keep React components focused and readable.
- Do not introduce client-only state libraries unless a concrete need exists.
- Use existing UI, layout, and feedback components before adding new primitives.

## API Service Rules

- All backend calls belong in `src/services`.
- Use `NEXT_PUBLIC_API_URL` as the backend origin only; do not append `/api/v1` in environment values.
- Include credentials for cookie-backed auth flows where services already require them.
- Surface backend error messages through user-facing error states when safe.
- Do not put backend secrets, OAuth secrets, JWT signing secrets, database URLs, Redis URLs, or OpenRouter keys in frontend environment variables.

## UI State and Experience Rules

- Every async workspace needs loading, error, and empty states.
- Empty states must explain what is missing and the next action.
- Error states must explain what failed and what the user can try.
- Mutating actions should expose pending state and refresh relevant data after success.
- Avoid fake data, mock dashboards, placeholder metrics, or fabricated AI messages.
- Keep UI professional, responsive, accessible, and useful for repeated product work.

## Accessibility and Responsive Design

- Use semantic HTML where practical.
- Keep buttons, links, forms, and interactive controls keyboard accessible.
- Preserve visible focus states.
- Use labels or accessible names for form controls and icon-only actions.
- Ensure text fits on mobile and desktop layouts.
- Do not rely on color alone to communicate risk or status.

## Testing Expectations

- Add Vitest/Testing Library coverage for meaningful UI behavior changes.
- Prefer testing visible outcomes and user interactions over implementation details.
- Mock service calls; do not require a live backend in frontend tests.
- Cover loading, error, empty, and success states for critical workspaces.
- Run relevant validation before handing off changes:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Naming Conventions

- Use kebab-case for files and folders.
- Use PascalCase for React components and exported types.
- Use camelCase for functions, variables, hooks, and object properties.
- Prefix React hooks with `use`.
- Keep component names aligned with the UI role they perform.

## Dependency Rules

- Prefer existing local components, services, and types before adding new abstractions.
- Do not add packages unless the task requires them and they fit the locked stack.
- Keep React Flow usage tied to real dependency graph data returned by the backend.
- Do not introduce monorepo tooling, Nx, Turborepo, or shared workspace assumptions.

## Forbidden Patterns

- Backend implementation logic in the frontend.
- Direct `fetch` calls scattered across pages/components instead of services.
- Secrets in frontend code or `NEXT_PUBLIC_*` variables.
- Fake metrics, fake repositories, fake scan results, fake APIs, or fake AI responses.
- Marketing-only pages replacing actual product screens.
- Disabling lint, typecheck, validation, or tests to make changes pass.
- Broad rewrites or unrelated refactors.
