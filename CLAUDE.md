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
- **Recharts** for charts (used in ReportingDashboard)
- **@react-pdf/renderer** for PDF generation (rental receipts)
- **react-day-picker** + **date-fns** for date inputs
- **next-themes** for dark/light mode toggle
- Path alias: `@/*` → `src/*`

## Architecture

### Directory Layout

```
src/
├── main.tsx              # App entry: wraps with QueryClientProvider + AuthProvider + Router
├── router.tsx            # Route definitions
├── routerMenuItems.ts    # Sidebar nav items, gated by role
├── protected-route.tsx   # ProtectedRoute component (allowedRoles prop)
├── breadcrumbs.ts        # Breadcrumb path config
├── constants/
│   └── roles.ts          # ROLE_LABELS map + getRoleLabel helper
├── hooks/
│   └── use-mobile.tsx    # useIsMobile hook
├── pages/
│   ├── Auth/             # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   ├── UserManagement/   # Admin user list, edit roles/locked status, delete
│   ├── InventoryManagement/     # Equipment inventory CRUD (EQUIPMENT_COMMITTEE)
│   ├── RentalPricing/           # Rental pricing management (EQUIPMENT_COMMITTEE)
│   ├── EquipmentBookingManagement/ # Review/approve rental bookings (EQUIPMENT_COMMITTEE)
│   ├── EquipmentRentalManagement/  # Manage equipment rentals (EQUIPMENT_COMMITTEE)
│   ├── EventManagement/         # Event CRUD (HIGH_COMMITTEE)
│   ├── MyRentalList/            # Student/non-student rental list + new rental stepper + receipts
│   └── ReportingDashboard/      # Analytics dashboard with KPI cards + charts (EQUIPMENT_COMMITTEE, HIGH_COMMITTEE)
├── store/
│   ├── auth-context.tsx  # AuthContext: user, login, logout, hasRole, updateUserRoles
│   ├── query-client.ts   # QueryClient config (staleTime 30s, retry 0 in dev)
│   ├── query-factory.ts  # Generic CRUD query/mutation builder (see below)
│   ├── queries/          # Feature query hooks (auth, user, equipment, event, rental, rental-pricing, receipt, report)
│   └── schemas/          # Zod schemas matching each query domain
├── components/
│   ├── Layout.tsx            # Shell with sidebar + outlet
│   ├── app-sidebar.tsx       # Role-aware nav sidebar with role switcher
│   ├── app-breadcrumb.tsx    # Breadcrumb component
│   ├── data-table.tsx        # Reusable TanStack Table wrapper
│   ├── date-picker.tsx       # Date picker using react-day-picker
│   ├── committee-user-select.tsx  # User select for committee assignment
│   ├── mode-toggle.tsx       # Dark/light mode toggle
│   ├── theme-provider.tsx    # next-themes provider wrapper
│   ├── reui/                 # Custom UI primitives (badge, stepper)
│   └── ui/                   # shadcn/ui primitives (do not edit manually)
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
└── utils/
    ├── axios-instance.ts # Axios setup, token injection, 401 refresh queue
    └── api-error.ts      # API error type helpers
```

### Page Structure Pattern

Each feature page follows a consistent structure inside its directory:
- `main-page.tsx` — top-level page component; wraps content in `<FeatureProvider>`
- `provider.tsx` — React context provider with state (open dialogs, selected row, etc.)
- `context.ts` — `useFeatureContext()` hook
- `table-column-def.tsx` — TanStack Table column definitions
- `table-row-actions.tsx` — row action buttons/dropdowns
- `dialog-*.tsx` — individual dialog components (create, edit, delete, view, etc.)

### Authentication & Token Handling

- **Access token**: stored in memory only (inside `AuthContext`); injected into every request via Axios request interceptor.
- **Refresh token**: delivered as an `httpOnly` cookie; sent automatically via `withCredentials: true`.
- **Session restore**: on page load, `AuthContext` reads user profile from `localStorage` and calls `/api/v1/auth/refresh` to rehydrate the in-memory token.
- **401 handling**: Axios response interceptor queues concurrent failing requests, attempts one refresh call, retries queued requests on success, or redirects to `/login` on failure. The `skipAuthRefresh` flag on a request config opts out of this queue (used for login/refresh endpoints themselves).

### RBAC

Six roles (always prefixed with `ROLE_`): `ROLE_ADMIN`, `ROLE_STUDENT`, `ROLE_NON_STUDENT`, `ROLE_EQUIPMENT_COMMITTEE`, `ROLE_EVENT_COMMITTEE`, `ROLE_HIGH_COMMITTEE`.

- `ProtectedRoute` in `src/protected-route.tsx` accepts an `allowedRoles` prop and redirects unauthorized users.
- `hasRole(role)` from `AuthContext` checks the user's current `activeRole`.
- Users may hold multiple roles and switch between them via `useSwitchActiveRole()`.
- Sidebar menu items in `routerMenuItems.ts` are filtered by `activeRole`.
- `constants/roles.ts` exports `ROLE_LABELS` (display names) and `getRoleLabel(role)`.

### QueryFactory Pattern

`src/store/query-factory.ts` is a generic CRUD builder. Given a base URL and Zod schemas it produces:

- `list(filters)` — paginated GET with query key based on filters
- `detail(id)` — GET by ID
- `customList(options)` — GET to a suffixed URL with its own response schema (e.g. `/kpi`, `/rental-status`)
- `customQuery(options)` — parameterized GET where URL and query key are functions of a param (e.g. `/rental-volume?months=6`)
- `customMutation(options)` — POST/PATCH/DELETE with optional request/response validation, automatic toast on success, and query invalidation
- `mutationOption(type)` — standard create/edit/delete/soft-delete mutations with automatic URL construction

All query hooks in `src/store/queries/` are thin wrappers around QueryFactory or raw `useQuery`/`useMutation`.

### API Conventions

- Base URL: `VITE_API_URL` env var, or `http://localhost:8080` in dev (also proxied via Vite's `/api` proxy).
- All endpoints are prefixed `/api/v1/`.
- Responses are validated against Zod schemas before being returned to components.
- Pagination params: `page` (0-indexed), `size`, `role`, `search`.

### Stub Routes (not yet implemented)

- `/equipment-requests` — Equipment Requests (ROLE_EVENT_COMMITTEE)
- `/equipment-returns` — Return Rented Equipment (ROLE_STUDENT, ROLE_NON_STUDENT)
- `/equipment-request-returns` — Return Requested Equipment (ROLE_EVENT_COMMITTEE)
- `/equipment-return-management` — Equipment Return Management (ROLE_EQUIPMENT_COMMITTEE)

## Environment

The app is developed on WSL2. `vite.config.ts` sets `server.host: '0.0.0.0'` and `hmr.clientPort: 5173` for WSL compatibility. A Dockerfile with an nginx multi-stage build exists for production deployment.
