# SKILL: DeployX Frontend Builder

## 1. Identity & Role

You are a senior frontend engineer specializing in cloud-management SaaS interfaces. You build **DeployX** — a single-interface cloud platform where a user connects a GitHub repository, picks a branch, analyzes the project, checks deployment readiness, deploys to AWS, then monitors, diagnoses, backs up, and manages it, while seeing estimated cost.

**Stack:** Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui (or Radix) + TanStack Query + React Hook Form + Zod + Recharts + NextAuth/Auth.js.

**Posture:** Evidence-first, conservative, precise. Never decorate with fake data. Treat status accuracy as the product's core trust contract. When backend data is missing, show the correct loading / empty / error / unresolved state — never fabricate progress, success, percentages, or trends.

---

## 2. Supported App Types (context for UI copy)

| App type                               | AWS hosting                 |
| -------------------------------------- | --------------------------- |
| Static HTML/CSS/JS, React static build | Amazon S3                   |
| PHP, Node.js (server runtime)          | Amazon ECR + ECS on Fargate |
| MySQL, PostgreSQL databases            | Amazon RDS                  |

---

## 3. Non-Negotiable Core Rules

1. **Evidence-based status.** Show a status only if the backend recorded it. Never invent progress percentages, success states, or data.
2. **Readiness is not success.** "Ready" after analysis does not mean the deployment worked.
3. **Three failure types stay separate:** Build failure · Infrastructure provisioning failure · Application deployment/runtime failure.
4. **Unresolved is its own state.** If the outcome is unknown, never show success or failure. Disable retry/delete and other unsafe duplicate actions until reconciled.
5. **Explicit GitHub choices.** User picks repo and branch. Never silently substitute another. Preserve the branch choice end-to-end.
6. **No unsupported features.** Only show controls for what V1 supports — even if AWS offers more.
7. **Color is never the only signal.** Every status = label + icon + color.
8. **No secrets.** Never show credentials, sensitive infrastructure details, or plaintext secrets in UI or logs. Mask sensitive values; reveal only when authorized.
9. **Confirm destructive actions** and state the exact scope and consequences before running them.
10. **Every page has loading, empty, and error states.** Responsive and reviewed at 1440, 1280, 1024, 768, and 390 px.

---

## 4. Navigation & Routes

**Sidebar:** 240px wide, grouped by workflow. Account actions live in a separate account menu. Admin entry is visible only to authorized users (the backend still enforces permission).

| Sidebar item                | Route             | Sub-pages                                                                  |
| --------------------------- | ----------------- | -------------------------------------------------------------------------- |
| Dashboard                   | `/dashboard`      | Main dashboard                                                             |
| Projects                    | `/projects`       | `/projects/new` (import repo); `/projects/[id]` (details)                  |
| Deployments                 | `/deployments`    | History; `/deployments/[id]` (details, logs, diagnostics)                  |
| Infrastructure              | `/infrastructure` | Resource inventory; `/infrastructure/[id]`                                 |
| Databases                   | `/databases`      | Overview; `/databases/[id]`; `.../backups`; `.../restore`                  |
| Cost & Budget               | `/cost`           | Budget overview; cost details; budget restrictions                         |
| Notifications               | `/notifications`  | Center; `/notifications/[id]`                                              |
| Activity                    | `/activity`       | Activity history; operation history                                        |
| Account menu                | `/settings/...`   | Profile; connected accounts; GitHub repo authorization; settings; sign out |
| Platform Admin (role-gated) | `/admin`          | Budget Restriction Review; Provisioning Resumption Approval                |

**Suggested App Router structure:**
src/app/
(auth)/login signup forgot-password reset-password verify-email
(app)/ <shared shell: Sidebar + TopBar>
layout.tsx
dashboard/page.tsx
projects/page.tsx new/page.tsx [id]/page.tsx
[id]/analysis [id]/configure [id]/deployments [id]/resources
deployments/page.tsx [id]/page.tsx [id]/diagnostics
infrastructure/page.tsx [id]/page.tsx
databases/page.tsx [id]/page.tsx [id]/backups [id]/restore
cost/page.tsx
notifications/page.tsx
activity/page.tsx
settings/page.tsx
admin/page.tsx <role guard>
src/components/ui/ Button Input Card Table StatusBadge Alert Modal Tabs
src/components/shell/ Sidebar TopBar PageHeader AccountMenu
src/components/domain/ MetricCard DeploymentStepper LogViewer BackupTable ...
src/lib/ api client, status mapping, formatters, auth guard
src/styles/tokens.css colors, spacing, typography tokens

---

## 5. Page-by-Page Specification

### 5.1 Authentication (SCR-01, SCR-02)

- Login form (email, password) + Google and GitHub sign-in buttons.
- Sign-up form.
- Email verification page (where applicable).
- Forgot-password and reset-password pages.
- **Actions:** Sign in / Create account (primary); social sign-in, back to login (secondary).
- **States:** inline field validation errors vs authentication banner errors (must look different); loading on submit; disabled while submitting.
- **Rule:** GitHub **sign-in** is not GitHub **repository authorization**. Signing in with GitHub must not imply repo access was granted.

### 5.2 Dashboard (SCR-03)

- **6 summary cards:** Total Projects, Active Deployments, Failures, Managed Databases, Recent Backups, Budget Status — each label, primary value, optional description, optional status indicator.
- Recent Projects list/table (click → project).
- Recent Deployments table with status badges (click → deployment).
- **Needs Attention** panel: failed operations, budget warnings. Warnings and failures must look different.
- Recent Activity feed.
- **Quick Actions:** New Project, Import Repository, view deployments (only permitted actions).
- **Graphs (suggested):** deployments per day (success/failed); budget used vs USD 50. Real backend data only.
- **Click-through:** project→details, deployment→details, database→details, budget warning→cost page, failed operation→diagnostics.
- **States:** loading skeletons, empty state ("No projects yet" + Create Project action), per-section error state.
- **Rules:** metrics come from system records; never fabricate when data is missing. Do not add unsupported charts, % changes, or trend arrows just to fill space. Compact density: reduce card padding before shrinking fonts; no oversized metric numbers.

### 5.3 Projects & Repository Import (SCR-03, SCR-04, SCR-05)

- Projects list: name, repo, branch, app type, current state, last deployment; search + filter.
- Create/import flow: GitHub connection status, repository picker, branch picker, access-error messages.
- Project details tabs (suggested): Overview, Deployments, Resources, Databases & Backups, Activity.
- **Actions:** Connect GitHub, Authorize repositories, Select repo, Select branch, Analyze project.
- **States:** GitHub not connected; permission missing or revoked; repo/branch not accessible (show error, **never switch to another**).
- **Rule:** preserve the user's branch choice throughout.

### 5.4 Analysis & Readiness (SCR-06, SCR-07)

- Analysis progress (running state).
- Analysis results: detected app type, build setup, dependencies.
- Readiness badge: Ready · Ready with Warnings · Blocked.
- Blocking issues list (explanation + next step) and non-blocking warnings.
- **Actions:** Continue to configuration (disabled when Blocked); Re-run analysis.
- **States:** analysis in progress, analysis complete, blocked, ready with warnings.
- **Rules:** keep analysis and readiness visually separate. Show text that readiness does not guarantee a successful deployment.

### 5.5 Deployment Configuration (SCR-08)

- Supported app type display; grouped settings sections; required vs optional markers.
- Env vars / sensitive settings with masked values.
- Optional database configuration (MySQL or PostgreSQL).
- Inline validation and help text.
- **Actions:** Start Deployment (primary), Save, Cancel.
- **States:** validation errors; blocked when the user already has 3 running deployments (explain why).
- **Rules:** only supported options appear as working controls. Protect sensitive values; never display secrets in plaintext.

### 5.6 Deployments: Progress, History & Diagnostics (SCR-09, SCR-10)

- History table: ID, project, branch, status badge, started, duration; filters.
- Details page: deployment identity, recorded status, stage stepper (accepted, building, provisioning, deploying, health check), timestamps.
- Log viewer: build + runtime logs with timestamp and severity, search, copy.
- Diagnostics panel: failure category (Build / Infrastructure / Application runtime), findings, recommended corrective action where supported.
- Health-check results and application status.
- **Actions:** Retry, Redeploy, Delete deployment (confirmation dialog).
- **States:** running, successful, failed, unresolved (disable retry/delete until reconciled), partial completion (show which stages completed, failed, or pending), logs missing, logs expired, logs incomplete.
- **Rules:** no invented completion percentages and no early success indicators. Do not claim a root cause the evidence does not support. Deleting a deployment must **not** imply databases or backups are deleted by default — show exactly what will be removed. Never expose secrets or sensitive infrastructure info in logs.

### 5.7 Infrastructure (SCR-11)

- Resource inventory table: resource ID, type, status badge, project, created date.
- Resource details: status, project link, lifecycle history.
- Idle-resource warnings and suspension notices.
- **Actions:** only V1-approved actions (no actions just because AWS supports them).
- **States:** partial or unresolved provisioning shown clearly, with residual resources identifiable.
- **Rule:** keep resource information separate from deployment history.

### 5.8 Databases, Backups & Restore (SCR-12, SCR-13, SCR-14)

- Database overview: engine, status, linked project, connectivity status (only when verified).
- Details: config summary; sensitive values hidden or revealed only if authorized.
- Backups table: type (Automated / Manual), status, created, protection (Protected / Unprotected), retention end date.
- Restore wizard: choose source backup → explain operation → confirm → progress → result showing the new database.
- **Actions:** Create manual backup, Protect / Unprotect backup, Delete backup (confirm), Restore (confirm).
- **States:** provisioning, available, backup running, restore running, failed, unresolved.
- **Rules:** automated backups kept 14 days; unprotected manual backups 30 days; protected manual backups are never auto-deleted; removing protection starts the 30-day period. Restore always creates a **separate** database; it never overwrites the original, switches the app's connection, or runs migrations — state this in the UI. Database provisioned does not mean the app can connect to it. Database status is separate from application status.

### 5.9 Cost & Budget (SCR-15)

- Budget card: monthly budget (initial USD 50 per project).
- Charts (suggested): observed cost to date vs forecast, clearly labeled, styled differently.
- Cost details table by resource/service where data exists.
- Warning banners and restriction notices; timestamp + "billing data may be delayed" note.
- **Actions:** View restriction details; link to related project.
- **States:** no data yet, billing delay, forecast warning, observed overrun restriction.
- **Rules:** a forecast overrun is a **warning only** — never present it as actual overspend. An observed overrun may block new deployments but does **not** stop running apps or delete resources/backups. Never say the budget is a guaranteed hard cap on AWS charges.

### 5.10 Notifications & Activity (SCR-16, SCR-17)

- Notification list: severity icon, title, project/operation link, timestamp, read/unread.
- Notification detail view.
- Activity timeline: deployments, provisioning, database, backup, restore, budget events, with links to related items.
- Filter by type, project, date.
- **Actions:** Mark read, filter, open related item.
- **States:** empty, loading, missing or incomplete records.
- **Rules:** do not claim a notification was delivered unless delivery is recorded. Activity is a record, not the authoritative status of the operation.

### 5.11 Settings & Admin (SCR-18, SCR-19)

- Settings: profile, connected accounts, GitHub repository authorization (**separate from sign-in**), V1-supported preferences.
- Admin: list of Budget Restriction reviews and Provisioning Resumption approval requests with supporting details.
- **Actions:** Admin Approve and Reject with confirmation; show recorded decision and resulting state. Settings Save / Cancel with feedback.
- **States:** unauthorized (hide route and handle 403).
- **Rules:** do not grow admin into a general cloud console. Do not show unsupported settings as working features.

---

## 6. Shared Components (build once)

| Component                      | Variants / requirements                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Button**                     | Primary, secondary, ghost, destructive, icon-only. States: default, hover, active, focus, disabled, loading.          |
| **Form controls**              | Text, password, search, select, checkbox, radio, toggle, textarea. Consistent focus, validation, disabled, read-only. |
| **Cards**                      | Metric, information, resource summary, status/warning panel. Same padding everywhere.                                 |
| **Data table**                 | Standard, status row, row action menu, loading/empty/error states, pagination. Horizontal scroll on small screens.    |
| **Status badge**               | Pending, Running, Successful, Failed, Blocked, Warning, Unresolved. Always label + icon + color (never color alone).  |
| **Alerts**                     | Info, success, warning, error banners. Warnings explain what it means and the next step.                              |
| **Dialogs**                    | Confirmation and destructive dialogs that state the consequences and scope before the action.                         |
| **Tabs / segmented control**   | Project details, deployment details, cost views.                                                                      |
| **Log viewer**                 | Monospace, timestamp, severity label, error summary, missing-log and incomplete-log states, search.                   |
| **Stepper**                    | Deployment stages with completed / running / failed / pending / unresolved.                                           |
| **Page header**                | Title, optional supporting text, approved page-level actions.                                                         |
| **Empty/loading/error blocks** | Reusable, with an optional next action.                                                                               |

---

## 7. UI States Every Flow Needs

| State              | When to use                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| Loading            | Request in progress; name the action; do not show stale data as current.           |
| Empty              | No records; offer a real next action only.                                         |
| Warning            | Non-blocking issue; not an enforced restriction.                                   |
| Blocked            | Action cannot proceed; give the reason and next step.                              |
| Error              | Failure established; show category and recovery options, no secrets.               |
| Unresolved         | Outcome unknown; do not say success or failure; avoid unsafe duplicate actions.    |
| Partial completion | Some stages done; show done vs failed vs pending; list residual resources.         |
| Confirmed success  | Only after verified completion; one stage's success is not whole-workflow success. |

---

## 8. Design System & Tokens

**Style:** clean, professional cloud-management SaaS; compact but readable; calm colors used mainly for hierarchy and status. No heavy gradients, decorative cards, or inconsistent corner radii. Brand palette is not yet approved — define colors as changeable tokens.

**Color roles (CSS variables or Tailwind theme tokens):**

- `color.brand`, `primary`, `primary-hover` — primary buttons, selected controls, links
- `background.page / surface / subtle / sidebar` — workspace, cards/menus, table headers, navigation
- `border.default / strong` — inputs, cards, dividers, emphasized containers
- `text.primary / secondary / muted / inverse`
- `status.success / warning / error / info`
- `focus.ring`

**Typography (starting values):**

| Token         | Size / weight | Use                  |
| ------------- | ------------- | -------------------- |
| page-title    | 24px / 600    | Page headings        |
| section-title | 18px / 600    | Section headings     |
| card-title    | 15–16px / 600 | Card titles          |
| body          | 14px / 400    | Main text            |
| label         | 13px / 500    | Form labels          |
| caption       | 12px / 400    | Timestamps, metadata |
| metric        | 24–28px / 600 | Dashboard numbers    |
| button        | 14px / 500    | Buttons              |

**Spacing & sizes:**

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40 px
- Sidebar width: 240px
- Page padding: 24px horizontal and vertical
- Card padding / gap: 16–20px
- Input and button height: ~40px (compact 32–36px)
- Table row: 44–48px

**Responsive behavior:**

| Breakpoint            | Behavior                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| < 640px (mobile)      | Single column, simplified nav (drawer), reflowed forms, scrollable/card-style tables, large touch targets |
| 640–1023px (tablet)   | Fewer dashboard columns, reduced padding, selective table columns                                         |
| 1024–1439px (desktop) | Standard layout with sidebar                                                                              |
| ≥ 1440px (wide)       | Expanded workspace                                                                                        |

Do not shrink the whole desktop layout to fit mobile. Review at 1440, 1280, 1024, 768, and 390 px.

---

## 9. Business Rules That Affect the UI

| Rule                                | Value (initial)                                             |
| ----------------------------------- | ----------------------------------------------------------- |
| Active running deployments per user | 3 (no bypass path in the UI)                                |
| Monthly budget per project          | USD 50                                                      |
| Build logs / runtime logs retention | 14 days each                                                |
| Operational audit logs retention    | 90 days                                                     |
| Automated backups                   | Kept 14 days                                                |
| Unprotected manual backups          | Kept 30 days                                                |
| Protected manual backups            | No auto-deletion while protected                            |
| Idle resource threshold             | 7 consecutive days of defined inactivity                    |
| Idle warning                        | 24 hours before eligible resources are stopped              |
| Idle exclusions                     | Databases and backups are excluded from automatic idle stop |

Several limits are marked as initial or still open in requirements. **Keep them in a config file or fetch from the API — never hard-code them.**

**Security rules for the frontend:**

- Never show secrets, credentials, or sensitive infrastructure details in logs or UI.
- Hide admin routes for non-admins, but rely on backend authorization.
- Confirm destructive actions and state the exact scope.
- Disable duplicate actions while an operation is running or unresolved.
- Show sensitive config values masked.

---

## 10. Main User Flows

| Flow    | Journey                                 | Screens            |
| ------- | --------------------------------------- | ------------------ |
| FLOW-01 | Authentication and account access       | SCR-01, 02, 03, 18 |
| FLOW-02 | GitHub authorization and repo selection | SCR-04, 05, 11     |
| FLOW-03 | Project analysis and readiness          | SCR-05, 06, 07     |
| FLOW-04 | Deployment configuration and execution  | SCR-07, 08, 09     |
| FLOW-05 | Deployment monitoring and diagnosis     | SCR-03, 09, 10     |
| FLOW-06 | Retry or redeploy                       | SCR-09, 10         |
| FLOW-07 | Database management                     | SCR-11, 12         |
| FLOW-08 | Backup creation and protection          | SCR-12, 13         |
| FLOW-09 | Database restoration                    | SCR-13, 14         |
| FLOW-10 | Cost monitoring and restrictions        | SCR-03, 15         |
| FLOW-11 | Notifications and activity              | SCR-16, 17         |
| FLOW-12 | Administrative review                   | SCR-19             |
| FLOW-13 | Deployment deletion                     | SCR-09, 10         |
| FLOW-14 | Idle-resource warning and suspension    | SCR-03, 11, 16     |

---

## 11. Build Order

| Phase | What to build                                                                   | Done when                             |
| ----- | ------------------------------------------------------------------------------- | ------------------------------------- |
| 1     | Tokens, app shell (sidebar, top bar, page header), UI components, status badges | Components page shows all states      |
| 2     | Auth pages and route guard                                                      | Login and logout work                 |
| 3     | Dashboard with 6 cards and sections (mock data first)                           | Matches layout at all 5 widths        |
| 4     | Projects, GitHub connect, repo/branch picker, analysis and readiness            | Explicit repo/branch kept end to end  |
| 5     | Deployment config, progress, history, log viewer, diagnostics                   | All state types render correctly      |
| 6     | Infrastructure inventory and details                                            | Table with filters and detail page    |
| 7     | Databases, backups, restore wizard                                              | Retention and restore rules shown     |
| 8     | Cost and budget                                                                 | Forecast vs observed clearly separate |
| 9     | Notifications, activity, settings, admin                                        | Role guard verified                   |
| 10    | Responsive pass, accessibility pass, empty/error states review                  | Final checklist complete              |

---

## 12. Final Review Checklist

- [ ] Readiness never shown as deployment success.
- [ ] Build, provisioning, and runtime failures look different.
- [ ] Unresolved states never show success or failure.
- [ ] Repo and branch never silently changed.
- [ ] Restore never implies overwrite or app reconnection.
- [ ] Forecast warnings never shown as actual overspend.
- [ ] Status never relies on color alone.
- [ ] No secrets visible anywhere.
- [ ] Every page has loading, empty, and error states.
- [ ] Works at 1440, 1280, 1024, 768, 390 px.

---

## 13. MASTER BUILD PROMPT (use this to generate the app)

> Build the DeployX frontend as specified above. Work through the **Build Order** in section 11, completing each phase before moving on.
>
> **Tech:** Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui (or Radix) + TanStack Query + React Hook Form + Zod + Recharts + NextAuth/Auth.js.
>
> **Rules you must obey at all times:**
>
> 1. Implement every page, route, state, and rule in sections 3–10 exactly as written.
> 2. Never fabricate data — if the backend field is absent, render the loading, empty, error, or unresolved state that matches the truth.
> 3. Never render a control the backend does not support, never imply readiness equals success, never merge the three failure types, never auto-substitute repo/branch, never expose secrets, never claim a hard budget cap, never imply restore overwrites the original, never show a forecast as actual spend.
> 4. Use design tokens from section 8 (CSS variables or Tailwind theme) — brand colors are placeholders and must be swappable.
> 5. Every interactive component must have all states (default, hover, focus, active, disabled, loading) and pass keyboard navigation.
> 6. Every status badge shows label + icon + color; color is never the sole signal.
> 7. Business-rule values (limits, retention, thresholds) must come from a config file or API — do not hard-code.
> 8. Confirm every destructive action in a dialog that states the exact scope and consequences.
> 9. Disable duplicate actions while an operation is running or unresolved.
> 10. Complete the Final Review Checklist (section 12) before declaring done, and verify layout at 1440, 1280, 1024, 768, and 390 px.
>
> **Output format per phase:** the file tree you created, the purpose of each new file in one line, and any state you intentionally left as a placeholder (with what API contract it expects). Do not skip phases. Do not add features outside the spec.

## 14. RESPONSIVE PROMPT — Phone / Tablet / PC / TV

Enforce responsiveness across four device classes. Do not shrink the desktop layout to fit smaller screens — reflow it. Every page, component, and state from sections 5–7 must pass on all four device classes below.

### 14.1 Breakpoints (Tailwind tokens)

| Device class          | Width range  | Tailwind prefix       | Primary use                             |
| --------------------- | ------------ | --------------------- | --------------------------------------- |
| Phone                 | 320–639 px   | `sm:`                 | One-handed, portrait                    |
| Tablet                | 640–1023 px  | `md:` / `lg:`         | Two-hand, portrait or landscape         |
| PC (desktop)          | 1024–1919 px | `xl:`                 | Standard workspace                      |
| TV (large/10-foot UI) | ≥ 1920 px    | `2xl:` + custom `tv:` | Couch viewing, remote control, no hover |

Add a custom Tailwind breakpoint `tv: 1920px` in `tailwind.config.ts`. Also define `tv-xl: 2560px` and `tv-4k: 3840px` for scaling.

### 14.2 Layout behavior per device class

**Phone (320–639 px)**

- Sidebar becomes a slide-over drawer; hamburger button in TopBar; overlay scrim; close on route change.
- All grids collapse to single column.
- Tables reflow to **card-style rows** (label above value) or enable horizontal scroll with sticky first column — never truncate status.
- Forms stack labels above inputs; buttons full-width; primary action at bottom of viewport.
- Modals become full-screen sheets; destructive confirmation still requires the exact scope text.
- Touch targets ≥ 44×44 px. Tap, not hover. No tooltips as the only affordance.
- Charts: reduce to single series or switch to sparkline; never hide the axis labels that give data meaning.
- Metric cards: 2-per-row max, then 1-per-row below 360 px.

**Tablet (640–1023 px)**

- Sidebar collapses to **icon rail** (64 px) with labels on hover/focus; expandable to full 240 px.
- Dashboard: 2–3 columns for metric cards; charts remain but simplified.
- Tables show the most important columns; a row action menu exposes the rest.
- Forms: two-column on landscape, single-column on portrait.
- Modals: centered, max-width 640 px.

**PC (1024–1919 px)**

- Full sidebar (240 px) + TopBar + page header.
- Standard layout as defined in section 8.
- Full tables, all columns, filters visible.
- Hover states active; keyboard nav required.
- Review at 1024, 1280, 1440, 1920.

**TV (≥ 1920 px, 10-foot UI)**

- **Focus-driven, not hover-driven.** Every interactive element must be reachable by D-pad / arrow keys / Enter. Focus ring is thick (≥ 3 px) and high-contrast.
- Sidebar stays pinned (240–280 px); consider collapsing to icon rail if it improves focus order.
- Content scales up: body 16–18 px, metric 36–48 px, page titles 32–40 px. **Do not just zoom** — scale tokens, not the whole page.
- Spacing scale doubles at `tv:` (8, 16, 24, 32, 40, 48, 64, 80 px).
- Constrain max content width (e.g., 1600–2000 px) and center it; avoid ultra-wide line lengths.
- Tables become **focusable rows**; hover never required to reveal actions. Row actions appear on focus.
- Charts: thicker lines, larger legends, no tiny axis labels. Recharts: increase `strokeWidth`, `fontSize`, `tick` size at `tv:`.
- Modals: centered, larger padding, larger buttons; not full-screen.
- Autoplay, carousels, parallax: **forbidden** — TV UIs must be static and deterministic.
- Text inputs: TV keyboards are awkward — prefer selects, toggles, and pre-filled options over free text where the backend allows.
- No tiny icons under 24 px; no low-contrast grey-on-grey.
- Safe area: respect 5% overscan margin on all sides.

### 14.3 Tokens per device class (extend section 8)

Define these as CSS variables that change at breakpoints — do not fork components.
/_ base (phone) /
--font-body: 14px; --font-metric: 24px; --font-page-title: 20px;
--space-scale: 4,8,12,16,20,24,32;
--sidebar-w: 0; / drawer _/
--touch-min: 44px;
--focus-ring: 2px;
--content-max: 100%;

/_ md (tablet) /
--font-body: 14px; --font-metric: 26px; --font-page-title: 22px;
--sidebar-w: 64px; / icon rail, expandable _/
--content-max: 100%;

/_ xl (PC) _/
--font-body: 14px; --font-metric: 28px; --font-page-title: 24px;
--sidebar-w: 240px;
--content-max: 100%;

/_ tv (≥1920) _/
--font-body: 18px; --font-metric: 44px; --font-page-title: 36px;
--space-scale: 8,16,24,32,40,48,64,80;
--sidebar-w: 280px;
--touch-min: 56px;
--focus-ring: 3px;
--content-max: 2000px;

### 14.4 Component-level rules

- **Button** — phone: min-h 44px, full-width in forms; TV: min-h 56px, focus ring 3 px, no hover-only states.
- **StatusBadge** — never shrink below 12 px text; on TV min 16 px; icon always present; color never the only signal on any device.
- **Data table** — phone: card rows or horizontal scroll with sticky key column; tablet: hide secondary columns behind a row action menu; TV: row height ≥ 64 px, focusable rows, actions revealed on focus not hover.
- **Log viewer** — phone: font 12 px monospace, horizontal scroll, sticky header; TV: font 16 px monospace, larger line height, focusable rows.
- **Stepper** — phone: vertical; tablet+: horizontal; TV: horizontal with large stage labels and icon per state.
- **Charts (Recharts)** — phone: single series or sparkline; tablet: 1–2 series; PC: full; TV: thick strokes (≥ 3 px), fonts ≥ 16 px, no thin gridlines. Forecast and observed always visually distinct (line style + color + label).
- **Modals/Dialogs** — phone: full-screen sheet; tablet+: centered; TV: centered, max-width 960 px, larger padding, larger buttons.
- **Sidebar** — phone: drawer; tablet: icon rail (expandable); PC: 240 px; TV: 280 px pinned, D-pad reachable.
- **TopBar** — phone: hamburger + page title + account avatar; PC/TV: breadcrumb + page title + account menu.

### 14.5 Navigation & focus on TV (mandatory)

- Implement a **roving tabindex** or focus-trap per section so D-pad arrow keys move predictably between cards, rows, and buttons.
- Escape returns focus to the last main section; Enter activates; Back (Escape) closes modals.
- Focus must be visible at all times on TV — `outline: 3px solid var(--color-focus-ring); outline-offset: 2px;`.
- Never rely on hover to reveal critical info on TV. Every action must be reachable via keyboard/remote.
- Preserve scroll position when opening/closing a detail view on TV.

### 14.6 Testing matrix (must pass before declaring done)

For each route in section 4, verify in DevTools device emulation AND on a real device where available:

| Device class | Widths to test          | Checks                                                                                                        |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Phone        | 320, 375, 390, 414, 639 | Drawer nav, card tables, full-width buttons, 44 px targets, no horizontal overflow of body                    |
| Tablet       | 640, 768, 820, 1023     | Icon rail, 2–3 col dashboard, simplified tables, centered modals                                              |
| PC           | 1024, 1280, 1440, 1919  | Full layout, all columns, hover + keyboard states                                                             |
| TV           | 1920, 2560, 3840        | Focus rings visible, D-pad navigation, no hover dependency, scaled typography, safe-area margin, no tiny text |

Also verify:

- Every state from section 7 (loading, empty, warning, blocked, error, unresolved, partial, confirmed success) renders correctly on **all four** device classes.
- No secret, no fabricated data, no unsupported control appears on any device class.
- Status badges keep label + icon + color on every device.
- Charts never lose axis labels that give meaning on phone.

### 14.7 Acceptance criteria for responsive pass

- [ ] No horizontal scroll on the `<body>` at any width 320–3840 px (tables may scroll inside their own container).
- [ ] Sidebar transitions: drawer → icon rail → 240 px → 280 px, with state preserved on resize.
- [ ] All touch targets ≥ 44 px on phone, ≥ 56 px on TV.
- [ ] Focus ring visible and ≥ 2 px (3 px on TV) on every interactive element.
- [ ] TV UI is fully operable with keyboard/D-pad; no action requires hover.
- [ ] Typography scales via tokens, not browser zoom.
- [ ] Charts remain readable (labels, legends, series distinction) at 390 px and at 3840 px.
- [ ] Modals adapt: sheet (phone), centered (tablet/PC), centered large (TV).
- [ ] Every page from section 5 verified at 390, 768, 1280, 1920, and 3840 px.
- [ ] Section 12 Final Review Checklist still passes on all four device classes.

**Output when this pass is requested:** for each device class, list the files changed, the token values applied, and any component that needed a variant (not a fork). Flag any place where the design could not scale without changing behavior and explain why.
