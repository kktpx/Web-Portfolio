# Admin Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin sidebar with a top bar and horizontal 5-tab nav, keeping the yellow theme.

**Architecture:** `AdminLayout` renders a new `AdminTopbar` above an `<Outlet />`. Tabs are `NavLink`s to routes nested under the existing `ProtectedRoute`. Unbuilt tabs render a shared `ComingSoon` page. No change to analytics or project logic.

**Tech Stack:** React 19, react-router-dom 7, lucide-react, plain CSS (`src/styles/admin.css` variables). The repo has no test runner; verification is `npm run lint`, `npm run build`, and manual checks in `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-10-20-admin-shell-design.md`

## Global Constraints

- Accent stays `--admin-accent: #ffcc00`; do not change theme colours. The "Live System" pill uses `--admin-success` (`#10b981`).
- Tabs, in order: Analytics `/admin`, Projects `/admin/projects`, Profile `/admin/profile`, Contact `/admin/contact`, Resume `/admin/resume`.
- `/admin/portfolio` must redirect to `/admin/projects`.
- Content max width ~1280px, centered. No hamburger/overlay; tabs scroll horizontally on mobile.
- Logout calls `useAuth().logout()` then navigates to `/admin/login` (same as current sidebar).
- Do not touch analytics or project CRUD logic.

## Review Focus

- Deep link / refresh on `/admin/projects` while logged in stays on that tab.
- Old bookmark `/admin/portfolio` lands on Projects, not a blank page.
- `/admin` tab must be active only on exactly `/admin` (use `end`), not on every sub-route.
- Logged-out visit to any `/admin/*` still goes through `ProtectedRoute` to login.
- At ~375px width the tab row scrolls horizontally and the page itself does not.

## File Structure

- Create `src/components/admin/AdminTopbar.jsx` + `AdminTopbar.css`: brand, live pill, tabs, logout.
- Create `src/pages/admin/ComingSoon.jsx`: placeholder page taking a `title` prop.
- Modify `src/components/admin/AdminLayout.jsx` / `.css`: topbar + outlet, drop mobile menu.
- Modify `src/App.jsx`: new routes and redirect.
- Modify `src/pages/admin/AdminDashboard.jsx:104`: link to `/admin/projects`.
- Delete `src/components/admin/AdminSidebar.jsx` / `.css`.

---

### Task 1: Top bar, layout and routes

**Files:**
- Create: `src/components/admin/AdminTopbar.jsx`, `src/components/admin/AdminTopbar.css`
- Modify: `src/components/admin/AdminLayout.jsx`, `src/components/admin/AdminLayout.css`, `src/App.jsx`

**Interfaces:**
- Produces: `AdminTopbar` default export, component with no props. Tabs defined as a const array `TABS = [{ to, label, icon, end? }]` in the file.
- Produces: routes `/admin` (index → `AdminDashboard`), `/admin/projects` (→ `PortfolioManager`).

- [ ] **Step 1: Create `AdminTopbar`** — two rows. Row 1: brand `Portfolio / Admin` (`Portfolio` white, `Admin` in `--admin-accent`), pill "Live System" with a green dot, Log out button on the right (`LogOut` icon, calls `logout` then `navigate('/admin/login')`, log errors to console like the old sidebar). Row 2: `<nav>` with five `NavLink`s using icons `BarChart3`, `FolderOpen`, `User`, `Mail`, `FileText` from lucide-react; Analytics has `end`. Active class `active` gets a surface background and `--admin-accent` text. Nav row: `overflow-x: auto`, `white-space: nowrap`, hidden scrollbar.
- [ ] **Step 2: Style `AdminTopbar.css`** using the existing `--admin-*` variables; bottom border `1px solid var(--admin-border)` under each row; row 1 height ~64px.
- [ ] **Step 3: Rewrite `AdminLayout.jsx`** to render `<AdminTopbar />` then `<main className="admin-content"><Outlet /></main>`; remove `useState`, mobile header, overlay and sidebar import. In `AdminLayout.css` replace contents with: `.admin-layout` as a column flex, min-height 100vh, `background: var(--admin-bg)`; `.admin-content` with `max-width: 1280px; width: 100%; margin: 0 auto`.
- [ ] **Step 4: Update `App.jsx`** admin routes: `<Route index element={<AdminDashboard />} />` and `<Route path="projects" element={<PortfolioManager />} />`; remove the `portfolio` route (redirect is added in Task 2).
- [ ] **Step 5: Verify** — Run `npm run lint` and `npm run build`; Expected: no errors. Run `npm run dev`, log in, confirm tabs Analytics and Projects render the existing pages, active tab highlights correctly, Log out returns to `/admin/login`.
- [ ] **Step 6: Commit** — `git add src/components/admin src/App.jsx` ; `git commit -m "feat(admin): top bar and tab navigation"`.

### Task 2: Placeholder tabs, redirect, cleanup

**Files:**
- Create: `src/pages/admin/ComingSoon.jsx`
- Modify: `src/App.jsx`, `src/pages/admin/AdminDashboard.jsx:104`
- Delete: `src/components/admin/AdminSidebar.jsx`, `src/components/admin/AdminSidebar.css`

**Interfaces:**
- Consumes: routes and layout from Task 1.
- Produces: `ComingSoon({ title: string })` default export; renders an `.admin-card` with the title and the text "Coming soon".

- [ ] **Step 1: Create `ComingSoon.jsx`** inside `.admin-page-container` using existing `admin-page-title` and `admin-card` classes.
- [ ] **Step 2: Add routes in `App.jsx`**: `profile`, `contact`, `resume` → `<ComingSoon title="Profile" />` etc.; and `<Route path="portfolio" element={<Navigate to="/admin/projects" replace />} />` (import `Navigate` from react-router-dom).
- [ ] **Step 3: Change the "Manage Portfolio" link** in `AdminDashboard.jsx:104` to `/admin/projects`.
- [ ] **Step 4: Delete the sidebar files**, then run `grep -rn "AdminSidebar" src`; Expected: no matches.
- [ ] **Step 5: Verify** — `npm run lint` and `npm run build` pass. In `npm run dev` check every item in Review Focus: refresh on `/admin/projects`; visit `/admin/portfolio` → lands on Projects; `/admin` active only on exact path; log out then open `/admin/projects` → login page; at 375px width the tab row scrolls and the page has no horizontal scroll.
- [ ] **Step 6: Commit** — `git add -A src` ; `git commit -m "feat(admin): placeholder tabs, redirect, remove sidebar"`.
