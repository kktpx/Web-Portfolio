# Admin Shell (Part 1 of 3) — Design

Part of the admin redesign. Parts: (1) shell, (2) Analytics v2, (3) Profile / Contact / Resume tabs. This spec covers part 1 only.

## Goal
Replace the admin sidebar with a top bar + horizontal tab nav, matching the reference screenshots' layout, while keeping the existing yellow accent theme.

## Scope
- Top bar: `Portfolio / Admin` brand, "Live System" green pill, Log out button (right).
- Tab row: Analytics, Projects, Profile, Contact, Resume (lucide-react icons). Active tab highlighted via `NavLink`. Horizontally scrollable on mobile; no hamburger/overlay.
- Content area centered, max width ~1280px.
- Theme: keep `--admin-accent: #ffcc00`. No colour change. Add a green token for the "Live" pill (reuse `--admin-success`).

## Routes (inside existing `ProtectedRoute`)
| Tab | Path | Content in part 1 |
|---|---|---|
| Analytics | `/admin` | existing `AdminDashboard` (rewritten in part 2) |
| Projects | `/admin/projects` | existing `PortfolioManager` |
| Profile | `/admin/profile` | "Coming soon" placeholder |
| Contact | `/admin/contact` | "Coming soon" placeholder |
| Resume | `/admin/resume` | "Coming soon" placeholder |

`/admin/portfolio` redirects to `/admin/projects`. Any internal links to `/admin/portfolio` (e.g. dashboard "Manage Portfolio" button) are updated.

## Components
- `AdminTopbar` (new, replaces `AdminSidebar`): brand, live pill, tabs, logout (uses `useAuth().logout`, then navigates to `/admin/login`).
- `AdminLayout`: renders `AdminTopbar` + `<Outlet />`; drops mobile menu state and overlay.
- `ComingSoon` (small shared placeholder page).
- Delete `AdminSidebar.jsx/.css` once unused.

## Out of scope
Analytics logic, project CRUD logic, Profile/Contact/Resume functionality, theme changes.

## Testing
`npm run lint` and `npm run build` pass. Manually verify in dev server: every tab navigates, active state correct, logout works, old `/admin/portfolio` redirects, layout OK at desktop and ~375px width.
