# Army Pink Wellness Portal: handoff

_State as of 24 November 2026. Update this file whenever the plan or launch status changes._

This is the starting point for anyone, human or AI assistant, picking up the work. For setup, read [`README.md`](../README.md) and the [Developer Onboarding guide](developer-onboarding.md).

## Project

A trauma-informed, anonymous wellness site for survivors of domestic violence, built by the Army Pink nonprofit.

- **No accounts, no backend.** Saving is device-only (IndexedDB).
- **Launch:** 30 November 2026, in English.
- **Team:** a team lead and 4 volunteer developers at about 5 hours a week each (about 13 focus hours a week in total).

## Where things are

- **GitHub:** `Army-Pink/Wellness-Portal` (public).
- **Project board:** #3. Milestones: W1–W5, "Art Room · 15 Jan 2027" (target now 29 Jan), "Release 1.1 · 19 Feb 2027" (now about March).
- **Technical Plan:** [`docs/technical-plan.md`](technical-plan.md). A shared doc version exists; keep both in sync.
- **Developer Onboarding:** [`docs/developer-onboarding.md`](developer-onboarding.md).
- **Decision records** in [`docs/decisions/`](decisions/):
  - `founder-brief-2026-10-26.md`: final FAQ wording, QA checklist
  - `founder-response-2026-11-24.md`: latest decisions, analytics verification, gallery estimate
  - `copy-pending-approval.md`
- **Audit and decisions D1–D6:** [`docs/architecture/0001-audit-and-gap-analysis.md`](architecture/0001-audit-and-gap-analysis.md).

## Stack

- React 19, TanStack Start in SPA mode, Vite 8, Tailwind v4, shadcn/Radix, Zod 3, idb 8, fflate, `@vercel/analytics` 2.0.1.
- The static build goes to `dist/client/_shell.html`; Vercel rewrites every route to it (`vercel.json`).
- Storage only through `src/lib/storage/` and `<SaveActions>` / `useSaving()`.
- Strict CSP: `vercel.json` headers plus a post-build hash-based meta tag (`scripts/inject-csp.mjs`).
- Tests: 96 Vitest/RTL and 104 Playwright, including axe checks on every page, (desktop + mobile). The e2e fixture fails on any request to another site or any CSP violation.
- Commands: `npm ci`, `npm run dev`, `npm test`, `npm run test:e2e`, `npm run build`, `npm run preview`. Needs npm 11; npm 10 crashes.

## Current state

**On `main`:** the P0 foundation plus all W1/W2 work:

- the founder's 9-question FAQ
- About Army Pink footer link
- the founder's saving terms
- readable text files in the download ZIP
- typed translation catalogs (`en.json`, `es.json`, `t()`)
- My Saved Items grouping and empty/error states
- TR-03 Spanish review status (PR #57)

**PR #59** (merged 24 November) applied the founder's decisions of 24 November:

- Esc activates Quick Exit everywhere, including while typing or with a dialog open (replaces D4).
- Vercel Web Analytics with a strict allowlist in `src/lib/analytics.ts`, active on the deployed site only, with query strings and fragments stripped from URLs.
- The privacy page and FAQ #7 describe aggregate analytics.
- FAQ #9 links to armypink.org; the duplicate emergency box under the FAQ is removed.
- The simulated PIN screen is removed.
- Spanish shows as "ES · pronto" and can't be selected (`SPANISH_ENABLED` in `src/lib/prefs.tsx`; tests use `<PrefsProvider allowSpanish>`).
- weather.com stays the Quick Exit destination.
- The updated plan doc.

**Also merged:** #57 (TR-03 review status) and #58 (AP-10a, axe accessibility checks on every page). AP-17 (deploy runbook) is in progress on branch `ap-17-deploy-runbook`.

## Before the 30 November launch

1. **AP-17 (#37):** first Vercel deployment and rollback runbook. **Nothing has been deployed yet.** Choose the Vercel plan: Pro is needed for custom analytics events.
2. **REL-01a (#38):** release checklist including the founder's 13 QA checks. On the live site, confirm analytics requests go only to the Portal's own domain and carry no content.
3. **REL-01b (#39):** stabilize and launch on 30 November.
4. **Optional:** TR-02b (#34).

## After launch

- **Gallery sharing (D7):** the founder wants the full Anonymous Survivor Art Gallery.
  - About 43 hours: one small managed service (e.g. Supabase or Vercel Blob plus a Vercel Function), human moderation, a consent step and success/failure feedback. Only the image is sent.
  - Built with the full Art Room (AP-16, about 36 hours including the spike), targeting **29 January 2027**.
  - Needs the founder to approve the service by 5 December and to name a moderator.
  - Issues: AP-22 (#44), AP-18 (#45).
- **Spanish:** stays off until a qualified, fluent (ideally native) reviewer finishes TR-06 (#36). Then set `SPANISH_ENABLED` to `true`.
- **Release 1.1 (about March 2027):** AP-13a–d, AP-14b, AP-14c, TR-04, TR-05, TR-07, AP-09, AP-10b.

## Working agreements

- **Ask first:** get the team lead's OK before any push, merge, deploy or GitHub change. Never push to `main` or force-push.
- **The repo is public:** no personal information (emails, local paths, names in bylines). Use your GitHub noreply address as your git email. Check files before pushing.
- **Founder's rule:** every visitor-facing sentence must match tested behavior. Change behavior and its wording in the same pull request.
- **Content:** don't invent clinical content, partner organizations or translations.
- **Docs:** keep the shared docs and their repo copies in sync. Write in plain language with to-do lists. Keep tickets at 5 hours or less.

## Gotchas

- npm 10 crashes on this dependency tree; use npm 11 (`npx -y npm@11 ci`).
- The CSP hash must be computed on the parsed script text: TanStack writes NUL characters, and the browser turns them into U+FFFD before hashing.
- Vitest: import `fake-indexeddb/auto`, then use `new IDBFactory()` per test. jsdom's `Blob` has no `arrayBuffer()`; read it with `FileReader`.
- In zsh, a flag stored in `$VAR` isn't split into separate words, so `gh issue edit $FLAGS` fails. Write flags out in full.
