# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173, proxies /api/* → localhost:8080)
npm run build     # TypeScript check + Vite production build → /dist
npm run lint      # ESLint on all TypeScript files
npm run preview   # Serve the production build locally
```

No test runner is configured. The backend must be running on port 8080 for API calls to work.

## Tech Stack

- **React 19** + **TypeScript** (strict mode), built with **Vite 7**
- **React Router v7** for routing
- **TanStack React Query v5** for server state; **React Context API** for auth state
- **Axios** with custom interceptors for API calls
- **shadcn/ui** (New York style) + **Radix UI** + **Tailwind CSS v4**
- **Zod 4** for runtime schema validation
- **TanStack React Table v8** for data tables
- Path alias: `@/*` → `src/*`

## Architecture

### Directory Layout

```
src/
├── main.tsx              # App entry: wraps with QueryClientProvider + AuthProvider + Router
├── router.tsx            # Route definitions with ProtectedRoute wrappers
├── routerMenuItems.ts    # Sidebar nav items, gated by role
├── pages/
│   ├── Auth/             # Login, Register, ForgotPassword, ResetPassword
│   └── UserManagement/   # Admin user list, edit roles/locked status, delete
├── store/
│   ├── auth-context.tsx  # AuthContext: user, login, logout, hasRole, updateUserRoles
│   ├── query-client.ts   # QueryClient config (staleTime 30s, retry 0 in dev)
│   ├── query-factory.ts  # Generic CRUD query/mutation builder (see below)
│   ├── queries/          # Feature query hooks (auth.ts, user.ts)
│   └── schemas/          # Zod schemas (auth.ts, user.ts, register.ts)
├── components/
│   ├── Layout.tsx        # Shell with sidebar + outlet
│   ├── app-sidebar.tsx   # Role-aware nav sidebar with role switcher
│   └── ui/               # shadcn/ui primitives (do not edit manually)
└── utils/
    ├── axios-instance.ts # Axios setup, token injection, 401 refresh queue
    └── utils.ts
```

### Authentication & Token Handling

- **Access token**: stored in memory only (inside `AuthContext`); injected into every request via Axios request interceptor.
- **Refresh token**: delivered as an `httpOnly` cookie; sent automatically via `withCredentials: true`.
- **Session restore**: on page load, `AuthContext` reads user profile from `localStorage` and calls `/api/v1/auth/refresh` to rehydrate the in-memory token.
- **401 handling**: Axios response interceptor queues concurrent failing requests, attempts one refresh call, retries queued requests on success, or redirects to `/login` on failure. The `skipAuthRefresh` flag on a request config opts out of this queue (used for login/refresh endpoints themselves).

### RBAC

Six roles: `ADMIN`, `CLUB_MEMBER`, `EQUIPMENT_COMMITTEE`, `EVENT_COMMITTEE`, `GUEST`, `HIGH_COMMITTEE`.

- `ProtectedRoute` in `router.tsx` accepts an `allowedRoles` prop and redirects unauthorized users.
- `hasRole(role)` from `AuthContext` checks the user's current `activeRole`.
- Users may hold multiple roles and switch between them via `useSwitchActiveRole()`.
- Sidebar menu items in `routerMenuItems.ts` are filtered by `activeRole`.

### QueryFactory Pattern

`src/store/query-factory.ts` is a generic CRUD builder. Given a base URL and Zod schemas it produces:

- `list(filters)` — paginated GET with query key based on filters
- `detail(id)` — GET by ID
- `customMutation(method, path)` — POST/PATCH/DELETE with optional request/response validation, automatic toast on success, and query invalidation

All query hooks in `src/store/queries/` are thin wrappers around QueryFactory or raw `useQuery`/`useMutation`.

### API Conventions

- Base URL: `VITE_API_URL` env var, or `http://localhost:8080` in dev (also proxied via Vite's `/api` proxy).
- All endpoints are prefixed `/api/v1/`.
- Responses are validated against Zod schemas before being returned to components.
- Pagination params: `page` (0-indexed), `size`, `role`, `search`.

### Stub Routes (not yet implemented)

Equipment Management, Equipment Requests, Equipment Rent, Event Management, Equipment Returns, Reporting Dashboard — routes exist but pages are placeholders.

## Environment

The app is developed on WSL2. `vite.config.ts` sets `server.host: '0.0.0.0'` and `hmr.clientPort: 5173` for WSL compatibility. A Dockerfile with an nginx multi-stage build exists for production deployment.
