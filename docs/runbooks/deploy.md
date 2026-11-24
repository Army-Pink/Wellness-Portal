# Deploy and rollback runbook

How the Portal gets onto the internet, how to check it, and how to undo a bad release. Written for a new volunteer: follow the steps in order and tick the boxes.

**Rules that never change**

- Nobody pushes to `main`. The team lead merges.
- Ask the team lead before any deploy, rollback or change in Vercel.
- Nothing a visitor saved, typed or made is ever sent anywhere. If a check below suggests it was, stop and tell the team lead.

## How it works

The Portal is a static site. `npm run build` writes the files to `dist/client`, and Vercel serves them. Vercel also applies the security headers and the "send every page to `_shell.html`" rewrite from `vercel.json`. There is no server and no database to roll back, only a set of files.

| Kind of deploy | Created when                | Address                         |
| -------------- | --------------------------- | ------------------------------- |
| **Preview**    | A pull request is pushed    | A unique `*.vercel.app` address |
| **Production** | `main` changes (a PR merge) | The Portal's public domain      |

Every deploy is kept by Vercel as an immutable snapshot. That is what makes rollback quick: Vercel points the domain back at an older snapshot. It does not rebuild.

## One-time setup (team lead, Vercel admin)

Do this once. Nothing has been deployed yet.

- [ ] Choose the plan. **Pro** is needed for custom analytics events; the free plan collects page views only (see `docs/decisions/founder-response-2026-11-24.md`).
- [ ] Create the Vercel project from the GitHub repository Army-Pink/Wellness-Portal.
- [ ] Leave **Framework Preset** as "Other". `vercel.json` already sets the install command, build command and output folder. Do not override them in the dashboard.
- [ ] Set **Production Branch** to `main`.
- [ ] Turn on **Web Analytics** for the project (only after the analytics PR is merged).
- [ ] Do not add any environment variables. The Portal needs none, and a secret in a static site would be public.
- [ ] Keep the account's two-factor sign-in on, and give volunteers the lowest role that lets them view deployments.
- [ ] Add the custom domain when the founder gives it, and confirm HTTPS works.

## Check a preview deploy

Do this for any change that touches `vercel.json`, `scripts/` or anything about saving or analytics. Replace `PREVIEW` with the preview address.

1. [ ] The pull request's Vercel check is green. Open the preview.
2. [ ] Click through the home page, one Recovery Room, the Calm Room, My Saved Items and the FAQ. Reload on a deep link such as `/privacy`; it must load, not show a 404.
3. [ ] Check the security headers:

```bash
curl -sI https://PREVIEW/ | grep -iE "content-security-policy|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|cross-origin-opener|x-robots"
```

All eight headers must appear. Compare with the `headers` list in `vercel.json`.

4. [ ] Check that a built asset is cached for a year: `curl -sI https://PREVIEW/assets/<any file from the page>` shows `cache-control: public, max-age=31536000, immutable`.
5. [ ] Open the browser's developer tools, Network tab, and use the Portal for a minute. Every request must go to the Portal's own address. Any other address is a failure.
6. [ ] The Console shows no "Content Security Policy" errors.
7. [ ] Quick Exit (the button and the Esc key) leaves the Portal.
8. [ ] Analytics (after the analytics PR is merged): on a preview or production address, requests go to the Portal's own path `/_vercel/insights/...` and carry no saved text. Also open `https://PREVIEW/_vercel/insights/script.js`: it must be JavaScript, not the Portal's home page. If it returns the home page, the catch-all rewrite in `vercel.json` is swallowing it; stop and tell the team lead.

## Production release

1. [ ] The release checklist (REL-01a) is complete and the founder has signed off.
2. [ ] The team lead merges the pull request into `main`. Vercel starts the production build by itself.
3. [ ] Wait for the deployment to show **Ready** in the Vercel dashboard. Note the deployment's address and time in the release thread.
4. [ ] Repeat the preview checks above on the public domain.
5. [ ] Tell the founder it is live.

If the build fails, nothing changes for visitors: the previous production deployment keeps serving. Read the build log, fix on a branch, and open a new pull request.

## Roll back

Use this when something harmful or broken is live, such as a page that will not load, a missing header, or a request going somewhere it should not. **When in doubt, roll back first and investigate afterwards.** Rolling back is safe: it changes no visitor data, because saved items live only in each visitor's browser.

**Fastest: Vercel dashboard** (about one minute)

1. [ ] Open the project, then **Deployments**.
2. [ ] Find the last deployment that was known to be good (its row says Production, Ready, and an earlier time). Open its menu and choose **Promote to Production** (shown as **Instant Rollback** on some plans).
3. [ ] Confirm. The domain now serves the old files.
4. [ ] Run the production checks above on the public domain, plus a reload of a deep link.
5. [ ] Tell the team lead and the founder what happened and which deployment is live.

**Alternative: Vercel command line** (team lead or admin only)

```bash
npx vercel rollback            # back to the previous production deployment
npx vercel rollback <address>  # back to a chosen deployment
```

**Fix forward after a rollback**

Rolling back does not change `main`. Until `main` is fixed, a later merge will deploy the bad code again, so:

1. [ ] Tell the team not to merge anything.
2. [ ] Revert the bad pull request on a branch (`git revert -m 1 <merge commit>`) and open a pull request. The team lead merges it.
3. [ ] After the new deploy is verified, tell the team merging can resume.

## Rollback rehearsal (AP-17 acceptance)

Practise once on the first real deployment, before launch, so the first real rollback is not the first time anyone tries it.

- [ ] Deploy `main` to production (or a preview) and verify it.
- [ ] Deploy a harmless second version, such as a punctuation fix.
- [ ] Roll back to the first deployment and confirm the domain serves it.
- [ ] Promote the second version again.
- [ ] Record the date, who did it, how long it took and anything unclear. Fix this runbook where it was unclear.

| Date | Who | Time taken | Notes |
| ---- | --- | ---------- | ----- |
|      |     |            |       |

## Where things are

| What                           | Where                                     |
| ------------------------------ | ----------------------------------------- |
| Headers, rewrite, build        | `vercel.json`                             |
| CSP script hashes (post-build) | `scripts/inject-csp.mjs`                  |
| Local copy of the live build   | `npm run build && npm run preview` (4173) |
| Release checklist              | `docs/technical-plan.md`, REL-01a (#38)   |
| Analytics rules                | `src/lib/analytics.ts`                    |

## Known gaps

- Nothing has been deployed yet, so no step here has been run against Vercel. The rehearsal above is what proves it.
- Branch protection on `main` (#11) needs a repository admin.
- The custom domain is not yet decided.
