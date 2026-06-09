# iFoto Frontend

React + TypeScript frontend for the iFoto equipment rental and management system. Serves students, event committees, and equipment administrators through a role-based interface.

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running on port 8080 (see backend repo)

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
```

The dev server proxies all `/api/*` requests to `http://localhost:8080`. The backend must be running for any API call to succeed.

### Available Scripts

```bash
npm run dev       # Vite dev server with HMR
npm run build     # TypeScript check + production build → /dist
npm run lint      # ESLint on all TypeScript files
npm run preview   # Serve the production build locally
```

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 7 |
| Routing | React Router v7 |
| Server state | TanStack React Query v5 |
| HTTP client | Axios (custom interceptors) |
| Validation | Zod 4 |
| UI components | shadcn/ui (New York) + Radix UI |
| Styling | Tailwind CSS v4 |
| Tables | TanStack React Table v8 |
| Calendar | FullCalendar 6 (daygrid + timegrid) |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Date inputs | react-day-picker + date-fns + @mui/x-date-pickers |
| Theming | next-themes |
| Toasts | sonner |

## User Roles

| Role | Default Landing | Access |
|------|----------------|--------|
| `ROLE_ADMIN` | `/user-management` | Manage users, roles, and account status |
| `ROLE_EQUIPMENT_COMMITTEE` | `/manage-inventory` | Inventory, rentals, event equipment, pricing, reports, bank details |
| `ROLE_HIGH_COMMITTEE` | `/event-management` | Create/manage events, view reports |
| `ROLE_EVENT_COMMITTEE` | `/equipment-requests` | Submit equipment requests for events |
| `ROLE_STUDENT` | `/equipment-rent` | Rent equipment, view receipts/invoices |
| `ROLE_NON_STUDENT` | `/equipment-rent` | Rent equipment, view receipts/invoices |

Users may hold multiple roles and switch between them via the sidebar role switcher.

## Features

### Equipment Inventory (`/manage-inventory`)
- Main equipment (cameras, lenses) and sub-equipment (accessories, consumables) CRUD
- Per-equipment status scheduling calendar — block dates with MAINTENANCE, UNAVAILABLE, CONVOCATION, MRM statuses
- Per-sub-equipment quantity hold calendar — reserve partial quantities for specific date ranges
- Computed statuses (AVAILABLE, BOOKED, IN_USE, PARTIALLY_AVAILABLE) derived server-side

### Rental Management (`/rental-management`)
- Paginated list of all rental bookings
- Review workflow: approve (with logistics override), reject, confirm manual payment, mark picked-up, mark returned
- Logistics calendar (`/rental-management/calendar`) — FullCalendar view of rental windows; drag-and-drop logistics editing and equipment reassignment
- Penalty invoice generation for overdue returns

### Event Equipment (`/event-equipment`)
- Paginated list of all event equipment requests
- Review workflow: approve, reject, mark picked-up, mark returned
- Logistics calendar (`/event-equipment/calendar`) — mirrors Rental Management calendar for event requests

### Event Management (`/event-management`)
- Event CRUD (name, date, location, notes)
- Nested equipment request list per event with cancel action
- New request creation with equipment selection and confirmation dialog

### My Rentals (`/equipment-rent`)
- Rental history with view and cancel actions
- 4-step new rental stepper:
  1. Pick equipment (availability-filtered multi-select)
  2. Pick date range
  3. Make payment (online, cash, bank transfer)
  4. View generated invoice/receipt (SSE-driven; documents appear as they are generated server-side)
- Downloadable PDF receipts and invoices (including overdue penalty documents)

### Reporting Dashboard (`/reporting-dashboard`)
- KPI cards: total rentals, revenue, active rentals, overdue count
- Charts: rental status breakdown, rental volume over time, revenue over time, equipment utilization

### User Management (`/user-management`)
- Paginated user list with search and filter
- Edit roles and locked status; delete accounts

### Rental Pricing (`/rental-pricing`)
- View and bulk-update daily/weekly/monthly rates per equipment category

### Committee Bank Details (`/committee-bank-details`)
- Save/update committee bank account details for payment instructions shown to renters

## Project Structure

```
src/
├── constants/          # Enum maps, labels, badge classes (roles, statuses, banks)
├── hooks/              # useIsMobile, useRentalEvents (SSE)
├── pages/              # Feature pages (see below)
├── store/
│   ├── queries/        # TanStack Query hooks for every API feature
│   ├── schemas/        # Zod validation schemas
│   ├── auth-context.tsx
│   ├── query-client.ts
│   └── query-factory.ts  # Generic CRUD query/mutation builder
├── components/
│   ├── ui/             # shadcn/ui primitives (do not edit manually)
│   ├── reui/           # Custom badge + stepper
│   └── *.tsx           # Shared components (tables, pickers, equipment selects, calendar)
├── lib/utils.ts        # cn() helper
└── utils/              # axios-instance, api-error helpers
```

Each feature page directory contains `main-page.tsx`, `provider.tsx`, `context.ts`, `table-column-def.tsx`, `table-row-actions.tsx`, and `dialog-*.tsx` files following a consistent pattern.

## Authentication

- Access tokens are stored in **`sessionStorage`** — they survive same-tab page refreshes but are cleared when the tab closes.
- Refresh tokens are `httpOnly` cookies sent automatically via `withCredentials: true`.
- On page load, the app checks `sessionStorage` for an existing token and decodes its JWT `exp` claim. If the token is present and not within 60 seconds of expiry, the session is restored instantly from `localStorage` with no network call. If absent, expired, or nearly expired, `/api/v1/auth/refresh` is called once.
- On any 401, the Axios response interceptor queues all concurrent requests, attempts one refresh, then retries or redirects to `/login`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend base URL |

Create a `.env.local` file to override defaults:

```env
VITE_API_URL=http://your-backend-host:8080
```

## Deployment

The repo includes a multi-stage Dockerfile:
1. **Build stage** — installs dependencies and runs `npm run build`
2. **Production stage** — nginx serves `/dist` as static files and proxies `/api/` to the `backend` Docker Compose service

```bash
docker build -t ifoto-frontend .
```

The nginx config handles SPA routing (`try_files $uri /index.html`) so all React Router paths work on hard refresh.

## WSL2 Notes

`vite.config.ts` sets `server.host: '0.0.0.0'` and `hmr.clientPort: 5173` for WSL2 compatibility. No additional configuration is needed.
