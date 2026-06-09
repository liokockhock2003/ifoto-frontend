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
- **FullCalendar 6** (daygrid + timegrid + interaction) for logistics calendar views
- **Recharts** for charts (used in ReportingDashboard)
- **@react-pdf/renderer** for PDF generation (rental receipts/invoices)
- **react-day-picker** + **date-fns** for date range inputs
- **@mui/x-date-pickers** for datetime inputs (rental/request logistics)
- **next-themes** for dark/light mode toggle
- **sonner** for toast notifications
- Path alias: `@/*` → `src/*`

## Architecture

### Directory Layout

```
src/
├── main.tsx              # App entry: wraps with QueryClientProvider + AuthProvider + Router
├── router.tsx            # Route definitions + RoleRedirect component
├── routerMenuItems.ts    # Sidebar nav items, gated by role
├── protected-route.tsx   # ProtectedRoute component (allowedRoles prop)
├── breadcrumbs.ts        # Breadcrumb path config
├── constants/
│   ├── roles.ts              # ROLE_LABELS map + getRoleLabel helper
│   ├── equipmentStatus.ts    # 8 status types; AVAILABLE/BOOKED/IN_USE/PARTIALLY_AVAILABLE are computed-only — excluded from EQUIPMENT_STATUS_OPTIONS (admin picker); MAINTENANCE/UNAVAILABLE/CONVOCATION/MRM are admin-settable
│   ├── equipmentCondition.ts # Equipment condition mappings (GOOD, FAIR, FAULTY)
│   ├── rentalStatus.ts       # 10 rental status values with labels, badge classes, chart colors
│   ├── requestStatus.ts      # 6 equipment request status constants
│   ├── paymentStatus.ts      # PAYMENT_STATUS_LABEL + PAYMENT_METHOD_LABEL maps
│   └── malaysianBanks.ts     # MALAYSIAN_BANKS array (17 banks) for bank-details form
├── hooks/
│   ├── use-mobile.tsx        # useIsMobile hook (breakpoint: 768px)
│   └── use-rental-events.ts  # SSE hook — streams document-ready events for a rental and invalidates receipt/invoice cache
├── pages/
│   ├── Auth/                    # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   ├── UserManagement/          # Admin user list, edit roles/locked status, delete (ROLE_ADMIN)
│   ├── InventoryManagement/     # Equipment inventory CRUD + nested status/quantity-hold schedule management (ROLE_EQUIPMENT_COMMITTEE)
│   ├── RentalPricing/           # Rental pricing bulk-update table (ROLE_EQUIPMENT_COMMITTEE)
│   ├── RentalManagement/        # Review/approve/mark-returned rental bookings + logistics calendar (ROLE_EQUIPMENT_COMMITTEE)
│   ├── EventEquipment/          # Review and manage event equipment requests + logistics calendar (ROLE_EQUIPMENT_COMMITTEE)
│   ├── EventManagement/         # Event CRUD + nested EquipmentRequestList + EquipmentRequest (ROLE_HIGH_COMMITTEE, ROLE_EVENT_COMMITTEE)
│   ├── MyRentalList/            # Student/non-student rental list + new rental stepper + receipts/invoices
│   ├── ReportingDashboard/      # Analytics dashboard with KPI cards + charts (ROLE_EQUIPMENT_COMMITTEE, ROLE_HIGH_COMMITTEE)
│   └── CommitteeBankDetails/    # Save/edit committee bank account info (ROLE_EQUIPMENT_COMMITTEE)
├── store/
│   ├── auth-context.tsx  # AuthContext: user, login, logout, hasRole, updateUserRoles
│   ├── query-client.ts   # QueryClient config (staleTime 30s, retry 0 in dev)
│   ├── query-factory.ts  # Generic CRUD query/mutation builder (see below)
│   ├── queries/          # Feature query hooks: auth, user, equipment, event, rental, rental-pricing, receipt, report, request
│   └── schemas/          # Zod schemas: auth, equipment, event, rental, rental-pricing, receipt, register, report, request, user
├── components/
│   ├── Layout.tsx                              # Shell with sidebar + outlet
│   ├── app-sidebar.tsx                         # Role-aware nav sidebar with role switcher
│   ├── app-breadcrumb.tsx                      # Breadcrumb component
│   ├── cart-summary.tsx                        # Rental cart display
│   ├── committee-user-select.tsx               # User select for committee assignment
│   ├── data-table.tsx                          # Reusable TanStack Table wrapper
│   ├── expandable-data-table.tsx               # Table variant with expandable rows
│   ├── management-table.tsx                    # Management-oriented table variant
│   ├── primary-tabs.tsx                        # Primary tab component
│   ├── date-picker.tsx                         # Single date picker (react-day-picker)
│   ├── range-date-picker.tsx                   # Date range picker
│   ├── date-time-picker.tsx                    # DateTime picker (@mui/x-date-pickers)
│   ├── mui-providers.tsx                       # Material-UI LocalizationProvider wrapper
│   ├── equipment-select.tsx                    # Equipment multi-select dropdown
│   ├── equipment-schedules.tsx                 # Displays status windows and quantity holds (calendar-aware conflict view)
│   ├── available-equipment-tables.tsx          # Main/sub equipment availability tables filtered by date range
│   ├── equipment-request-confirmation-dialog.tsx  # Request confirmation modal
│   ├── full-calendar.tsx                       # FullCalendar wrapper (daygrid/timegrid + interaction)
│   ├── schedule-entry-form.tsx                 # Form builder for date-range schedule entries
│   ├── mode-toggle.tsx                         # Dark/light mode toggle
│   ├── theme-provider.tsx                      # next-themes provider wrapper
│   ├── reui/                                   # Custom UI primitives (badge, stepper)
│   └── ui/                                     # shadcn/ui primitives (do not edit manually)
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

### InventoryManagement Sub-pages

`InventoryManagement/` contains two nested calendar-based schedule managers:
- `StatusScheduleManagement/` — per-equipment status scheduling calendar (route: `/status/:mainEquipmentId`)
- `QuantityScheduleManagement/` — per-sub-equipment quantity hold scheduling calendar (route: `/holds/:subEquipmentId`)

### RentalManagement Sub-pages

`RentalManagement/` contains:
- Root — paginated rental list with review/approve/reject/mark-returned actions
- `RentalLogisticManagement/` — logistics calendar view (`/rental-management/calendar` or `/rental-management/calendar/:rentalId`); shows rental pickup/return windows, allows editing logistics and assigned equipment

### EventEquipment Sub-pages

`EventEquipment/` contains:
- Root — paginated event equipment request list with review/approve/reject/mark-returned actions
- `EELogisticManagement/` — logistics calendar view (`/event-equipment/calendar` or `/event-equipment/calendar/:requestId`); mirrors RentalLogisticManagement but for event requests

### EventManagement Sub-pages

`EventManagement/` contains two nested sub-pages beyond the top-level event CRUD:
- `EquipmentRequestList/` — per-event list of equipment requests (ROLE_EVENT_COMMITTEE); dialogs: view, cancel
- `EquipmentRequest/` — create a new equipment request for an event; dialog: confirmation

Routes: `/equipment-requests`, `/equipment-requests/:eventId`, `/equipment-requests/:eventId/new`

### MyRentalList Sub-pages

`MyRentalList/` contains:
- Root — rental list with view/delete dialogs
- `EquipmentRental/` — new rental stepper (`rent-stepper.tsx`) with steps: pick equipments, pick date range, make payment, generated invoice/receipt; dialogs: payment, success. Step 4 uses `useRentalEvents(rentalId)` to open an SSE connection that invalidates receipt/invoice queries as documents are generated server-side.
- Receipt/Invoice views — `receipt-view.tsx`, `invoice-view.tsx`, `receipt-pdf.tsx`, `invoice-pdf.tsx`, `document-card.tsx`, `document-pdf.tsx`

### CommitteeBankDetails

`CommitteeBankDetails/` — single-page form for equipment committee to save/edit their bank account details (account holder name, bank name, account number). Uses `GET/PUT /api/v1/users/me/bank-details`. Includes `bank-name-combobox.tsx` driven by `MALAYSIAN_BANKS` constant.

Route: `/committee-bank-details` (ROLE_EQUIPMENT_COMMITTEE)

### Authentication & Token Handling

- **Access token**: stored in `sessionStorage` (key `__ift_at__`); survives same-tab page refreshes but is cleared when the tab closes. Injected into every request via Axios request interceptor.
- **Refresh token**: delivered as an `httpOnly` cookie; sent automatically via `withCredentials: true`.
- **Session restore**: on page load, `AuthContext` checks `sessionStorage` for an existing token and decodes its `exp` claim. If the token is present and not within 60 seconds of expiry, the user is restored from `localStorage` immediately — no network call. Otherwise (absent, expired, or nearly expired) calls `/api/v1/auth/refresh` once. `isTokenExpired(token, bufferSeconds?)` in `axios-instance.ts` handles the JWT decode.
- **401 handling**: Axios response interceptor uses a single shared `refreshPromise` lock. All concurrent 401s chain onto the same in-flight refresh instead of each firing a separate call — avoids the second call failing when the backend rotates the refresh token on first use. On success all waiters retry with the new token; on failure all reject and the user is redirected to `/login`. The `skipAuthRefresh` flag on a request config opts out of this flow entirely (used for login/refresh endpoints themselves).
- **Rate-limit guard**: `/auth/refresh` is only called when a valid token is not already in `sessionStorage`, i.e. once per new tab/window or when the token is expired — never on every same-tab page reload.

### RBAC

Six roles (always prefixed with `ROLE_`): `ROLE_ADMIN`, `ROLE_STUDENT`, `ROLE_NON_STUDENT`, `ROLE_EQUIPMENT_COMMITTEE`, `ROLE_EVENT_COMMITTEE`, `ROLE_HIGH_COMMITTEE`.

- `ProtectedRoute` in `src/protected-route.tsx` accepts an `allowedRoles` prop and redirects unauthorized users.
- `hasRole(role)` from `AuthContext` checks the user's current `activeRole`.
- Users may hold multiple roles and switch between them via `useSwitchActiveRole()`.
- Sidebar menu items in `routerMenuItems.ts` are filtered by `activeRole`.
- `constants/roles.ts` exports `ROLE_LABELS` (display names) and `getRoleLabel(role)`.

Role → default redirect (handled by `RoleRedirect` in `router.tsx`):
- `ROLE_ADMIN` → `/user-management`
- `ROLE_EQUIPMENT_COMMITTEE` → `/manage-inventory`
- `ROLE_HIGH_COMMITTEE` → `/event-management`
- `ROLE_EVENT_COMMITTEE` → `/equipment-requests`
- `ROLE_STUDENT` / `ROLE_NON_STUDENT` → `/equipment-rent`

### QueryFactory Pattern

`src/store/query-factory.ts` is a generic CRUD builder. Given a base URL and Zod schemas it produces:

- `list(filters)` — paginated GET with query key based on filters
- `detail(id)` — GET by ID
- `customList(options)` — GET to a suffixed URL with its own response schema (e.g. `/kpi`, `/rental-status`)
- `customQuery(options)` — parameterized GET where URL and query key are functions of a param (e.g. `/rental-volume?months=6`)
- `customMutation(options)` — POST/PATCH/DELETE with optional request/response validation, automatic toast on success, and query invalidation
- `mutationOption(type)` — standard create/edit/delete/soft-delete mutations with automatic URL construction
- `customStream(options)` — SSE helper; returns only `{ url(param) }` (no React Query state). Use when a feature needs a streaming endpoint alongside its regular queries (see `receipt.ts` + `use-rental-events.ts`)

All query hooks in `src/store/queries/` are thin wrappers around QueryFactory or raw `useQuery`/`useMutation`.

Query config functions (the raw `QueryOptions` objects returned by `customQuery`) can be exported directly from a query file when other hooks or non-component code need to access the query key or prefetch the data. The `receipt.ts` file does this: it exports both the raw config functions (`invoiceByRentalQuery`, `receiptByRentalQuery`, etc.) and the `useQuery`-wrapped hooks (`useInvoice`, `useReceipt`, etc.). The hooks add 404→`null` handling and the `enabled` guard on top of the raw config.

### API Conventions

- Base URL: `VITE_API_URL` env var, or `http://localhost:8080` in dev (also proxied via Vite's `/api` proxy).
- All endpoints are prefixed `/api/v1/`.
- Responses are validated against Zod schemas before being returned to components.
- Pagination params: `page` (0-indexed), `size`, `role`, `search`.

### Key API Endpoints

| Area | Method | Path |
|------|--------|------|
| Auth | POST | `/api/v1/auth/login`, `/register`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password` |
| Auth | GET | `/api/v1/auth/verify-email?token=X` |
| Users | GET/PATCH/DELETE | `/api/v1/users`, `/api/v1/users/:username` |
| Bank Details | GET/PUT | `/api/v1/users/me/bank-details` |
| Equipment | GET | `/api/v1/equipment`, `/api/v1/equipment/available?startDate&endDate&context&excludeRentalId?&excludeRequestId?` |
| Equipment | POST/PUT/DELETE | `/api/v1/equipment/main[/:id]`, `/api/v1/equipment/sub[/:id]` |
| Eq. Statuses | GET/POST/PATCH/DELETE | `/api/v1/equipment/main/:id/statuses[/:statusId]` |
| Qty Holds | GET/POST/PATCH/DELETE | `/api/v1/equipment/sub/:id/quantity-holds[/:holdId]` |
| Events | GET/POST/PUT/DELETE | `/api/v1/events[/:id]`, `/api/v1/events/my`, `/api/v1/events/users/:userId` |
| Rentals | GET | `/api/v1/rentals`, `/api/v1/rentals/my`, `/api/v1/rentals/my-approvals`, `/api/v1/rentals/:id/equipment-schedules` |
| Rentals | POST/PATCH/DELETE | `/api/v1/rentals[/:id]`, `/:id/review`, `/:id/pay`, `/:id/confirm-manual-payment`, `/:id/mark-picked-up`, `/:id/mark-returned`, `/:id/logistics`, `/:id/equipment` |
| Requests | GET | `/api/v1/event-equipment-requests`, `/event/:eventId`, `/:id/equipment-schedules` |
| Requests | POST/PATCH/DELETE | `/api/v1/event-equipment-requests[/:id]`, `/:id/review`, `/:id/mark-picked-up`, `/:id/mark-returned`, `/:id/logistics`, `/:id/equipment`, `/trigger-active` |
| Pricing | GET/PUT | `/api/v1/rental-pricing`, `/rental-pricing/bulk` |
| Receipts | GET | `/api/v1/receipts/invoice/rental/:id`, `/overdue-invoice/rental/:id`, `/receipt/rental/:id`, `/overdue-receipt/rental/:id` |
| SSE | GET | `/api/v1/receipts/events/rental/:id` |
| Reports | GET | `/api/v1/reports/kpi`, `/rental-status`, `/rental-volume?months=X`, `/revenue?months=X`, `/equipment-utilization` |

### Stub Routes (not yet implemented)

- `/equipment-returns` — Return Rented Equipment (ROLE_STUDENT, ROLE_NON_STUDENT)
- `/equipment-request-returns` — Return Requested Equipment (ROLE_EVENT_COMMITTEE)
- `/equipment-return-management` — Equipment Return Management (ROLE_EQUIPMENT_COMMITTEE)

## Environment

The app is developed on WSL2. `vite.config.ts` sets `server.host: '0.0.0.0'` and `hmr.clientPort: 5173` for WSL compatibility. A Dockerfile with an nginx multi-stage build exists for production deployment. The nginx config proxies `/api/` to `http://backend:8080` (Docker Compose service name).
