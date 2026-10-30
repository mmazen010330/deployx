# DeployX implementation log

## 2026-10-29 — Shared interface foundation

- Added reusable `PageHeader`, `StatePanel`, and `StatusBadge` components. The status badge covers pending, running, successful, failed, blocked, warning, and unresolved with text, icon, and color.
- Added explicit responsive CSS tokens for body/metric/title sizing, sidebar width, minimum touch target, focus ring, and content width; added `tv`, `tv-xl`, and `tv-4k` Tailwind v4 breakpoints.
- Added a high contrast `:focus-visible` outline and tablet sidebar rail/expand behavior.
- Reused the shared page header and state panel on project listing and import screens.

### Files added

- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/StatePanel.tsx`
- `src/components/ui/PageHeader.tsx`

### Files updated

- `app/globals.css`
- `app/projects/page.tsx`
- `app/projects/new/page.tsx`

## 2026-10-29 — Initial dashboard and project import foundation

- Replaced seeded dashboard projects, activity, deployment progress, and status claims with an evidence-based workspace view. The six requested metric cards now show unavailable values until backend data is connected; project, deployment, attention, and activity sections explain their current empty/unavailable states.
- Added the `/projects` route with a real empty state and links to repository import.
- Added `/projects/new` with an explicit GitHub-not-connected state. The screen makes clear that no repository, branch, or analysis has been selected or run, and keeps the unavailable GitHub action disabled.
- Replaced sidebar prototype actions and the sample account identity with real Dashboard and Projects links and an “Account not connected” label. The sidebar closes after navigation on mobile.
- Updated the shared top bar label to “DeployX workspace” so it does not claim every route is the dashboard.

### Current boundary

The repository has no connected backend, GitHub authorization flow, or account session. These screens do not create fake repository records, statuses, cost estimates, or deployment outcomes. The import flow becomes actionable when the authorization and repository APIs are implemented.

### Files changed

- `src/dashbord/page.tsx`
- `src/sidebar/page.tsx`
- `src/navebar/page.tsx`
- `app/projects/page.tsx`
- `app/projects/new/page.tsx`
