# Release checklist: 30 November 2026

The Portal ships only when every box below is ticked on the **live Vercel preview or production address**, not just on a developer's laptop. Tick a box only after you have done the check yourself and write your initials and the date beside it.

How to read "How it is checked":

- **Automated** means a test runs on every pull request (`npm test` or `npm run test:e2e`). Still look at it once on the preview, because tests do not run against Vercel.
- **Manual** means a person does it by hand, using the steps given.

Before you start, use the deploy checks in [`docs/runbooks/deploy.md`](runbooks/deploy.md). Test in a private window so old saved data does not confuse results.

## A. The founder's 13 checks (from the 26 October brief)

| #   | Check                                                                              | How it is checked                                                                                                                                      | Done |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | FAQ questions are numbered 1 to 9, in the brief's order                            | Automated (`e2e/faq.spec.ts`). Manual: read the home page FAQ against the brief.                                                                       | [ ]  |
| 2   | The hotline appears once per answer, with no repeated wording                      | Manual: read all 9 answers and count. The emergency box under the FAQ was removed on 24 Nov; confirm it is gone.                                       | [ ]  |
| 3   | The main website link points to https://armypink.org/                              | Automated (`e2e/faq.spec.ts`, `e2e/navigation.spec.ts`). Manual: click the FAQ #9 link and the footer link.                                            | [ ]  |
| 4   | The website link is optional and does not interrupt Portal use                     | Automated: the Portal works without it. Manual: confirm it opens only when clicked and never redirects.                                                | [ ]  |
| 5   | Saving behavior matches the Privacy / Your Choice screen                           | Automated (`src/test/privacy-choice.test.tsx`). Manual: choose each option and read the screen's wording against what happens.                         | [ ]  |
| 6   | Turning saving off stops future saves and does not silently delete existing items  | Automated (`privacy-choice.test.tsx`, "D5"). Manual: save an item, turn saving off, confirm the item is still in My Saved Items and a new save is not. | [ ]  |
| 7   | Download My Saved Items produces the intended ZIP                                  | Automated (`e2e/saving.spec.ts`). Manual: download, open the ZIP, confirm images, one readable `.txt` per text item, and the index.                    | [ ]  |
| 8   | ZIP creation does not upload the saved items to a server                           | Automated: every browser test fails on any request that leaves the Portal. Manual: watch the Network tab while downloading; nothing is sent.           | [ ]  |
| 9   | Artwork sharing is separate from private saving                                    | Manual: in the Art Room, confirm "save" and any sharing wording are different things, and that nothing says artwork is sent to a gallery.              | [ ]  |
| 10  | Gallery submission, feedback and anonymity claims are verified                     | Manual. Sharing is **not built**, so no page may claim it works. See "Known limitations" item 1.                                                       | [ ]  |
| 11  | Quick Exit and Esc work as described                                               | Automated (`e2e/navigation.spec.ts`, `src/test/quick-exit.test.tsx`). Manual: press Esc on a page, while typing, with a pop-up open, and on a phone.   | [ ]  |
| 12  | All privacy and safety language matches tested behavior                            | Manual review: read `/privacy`, the FAQ, Quick Exit and saving screens. For each sentence, point to the test or the manual step that proves it.        | [ ]  |
| 13  | Prototype-only statements are removed or updated before features are shown as live | Automated (`e2e/navigation.spec.ts`, "no visitor-facing page calls the Portal a prototype"). Manual: scan every page for "prototype" and "simulated".  | [ ]  |

## B. Release criteria from the plan (section 10)

| Area             | Pass condition                                                                          | How it is checked                                                                                | Done |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| Anonymous access | Both privacy choices reach every route; no name or email fields                         | Automated (`e2e/navigation.spec.ts`)                                                             | [ ]  |
| Local saving     | Saved items survive a reload and reopen at the right activity                           | Automated (`e2e/saving.spec.ts`, `e2e/recovery-rooms-saving.spec.ts`)                            | [ ]  |
| Delete           | Single and bulk delete need confirmation and persist                                    | Automated (`src/test/saved-items.test.tsx`, `e2e/saving.spec.ts`)                                | [ ]  |
| Storage failure  | Unavailable, full or corrupt storage fails gracefully with no false success             | Automated (`src/lib/storage/repository.test.ts`, `saved-items.test.tsx`)                         | [ ]  |
| No transmission  | No request leaves the Portal's own address on any route                                 | Automated (every browser test). Manual: Network tab on the live address.                         | [ ]  |
| Script injection | Injected inline scripts are blocked by the security policy                              | Automated (`e2e/navigation.spec.ts`). Manual: confirm the headers on the live address (runbook). | [ ]  |
| Accessibility    | No serious axe findings; keyboard-only path through each room; reduced motion respected | Automated axe checks (`e2e/a11y.spec.ts`). Manual: tab through one room.                         | [ ]  |
| Mobile           | Main flows work on a phone                                                              | Automated (mobile browser profile). Manual: one real phone.                                      | [ ]  |
| Spanish          | Spanish is switched off and shown as "ES · pronto"                                      | Automated (`e2e/faq.spec.ts`). Manual: confirm it cannot be selected.                            | [ ]  |
| Deployment       | Deploy steps and a rehearsed rollback are written down                                  | [`docs/runbooks/deploy.md`](runbooks/deploy.md); rehearsal log filled in (AP-17)                 | [ ]  |

## C. Analytics, checked on the live address

Analytics only run on the deployed site, so they cannot be checked on a laptop. Do this on the production or preview address.

- [ ] In the browser's Network tab, use the Portal for a minute. Every request goes to the Portal's own address. None goes to Google or any other site.
- [ ] Requests to the analytics path (`/_vercel/insights/...`) carry no saved text, typed text, artwork, names or search words.
- [ ] `/_vercel/insights/script.js` loads as JavaScript, not as the home page.
- [ ] No cookies are set (browser developer tools, Application tab).
- [ ] The privacy page and FAQ #7 describe aggregate, anonymous counts, as the analytics really behave.
- [ ] The Vercel plan is chosen. Custom events (rooms visited and so on) need **Pro**; the free plan collects page views only. If the plan is free, the privacy page must not promise more than page views.

## D. Known limitations (draft, for the founder to read before launch)

These are true on launch day. None blocks launch, but each should be a conscious decision.

1. **Gallery sharing is not built.** The Art Room's sharing step and the gallery show placeholder pictures only. The gallery page's intro still reads "Every piece is shared anonymously and only by choice", which could suggest sharing works. Decide before launch: reword it, or hide the page. (Needs the founder's decision; ties to D7 and #40.)
2. **Spanish is switched off.** Visitors see "ES · pronto". It turns on only after a qualified Spanish speaker reviews the sensitive text.
3. **Saved items live only on one device and one browser.** Clearing the browser's data, or using another device or a private window, loses them. Nothing is stored on a server. "Download My Saved Items" is the only backup.
4. **Quick Exit does not erase anything.** It leaves the site quickly. It does not clear browser history, downloads or saved items, and the wording must never say it does.
5. **Real content is placeholder.** Several rooms still show placeholder exercises and text until the content team supplies approved material.
6. **No emergency or live support.** The Portal shows the hotline but is not a crisis service.
7. **Analytics are aggregate only.** Page views, and room-level counts if Vercel Pro is chosen. No accounts, cookies or identifiers.

## E. Sign-off

| Step                                               | Who       | Date |
| -------------------------------------------------- | --------- | ---- |
| All boxes in A, B and C ticked on the live address | Team lead |      |
| Known limitations (D) read and accepted            | Founder   |      |
| Release approved for 30 November                   | Founder   |      |

If any check fails, do not launch. Fix it on a branch, re-run the affected checks, and tell the founder if the date moves. Use the rollback steps in the runbook if a problem is found after launch.
