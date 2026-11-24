# Founder's response of 24 November 2026: decisions and follow-up

The founder replied to the open questions from the 26 October brief. This records each decision, what changed in the build, and the two answers she asked for: the analytics verification and the gallery timeline.

## Decisions and what changed

| #   | Founder's decision                                                                                                                                       | Change in the build                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Esc activates Quick Exit everywhere: while typing, drawing or with a pop-up open. Replaces D4.                                                           | Esc now exits from anywhere, listening before any other page control. The intro, FAQ #3 and the privacy page say so.                                                      |
| 2   | Build the full gallery-sharing experience; don't treat it as a future feature.                                                                           | Assessment and timeline below. FAQ #5 keeps the current wording, which she approved as accurate for today, until sharing works.                                           |
| 3   | Aggregate analytics per the original specification; privacy text must reflect it.                                                                        | Vercel Web Analytics added with a strict event allowlist; the privacy page now describes it (verification below).                                                         |
| 4   | Make armypink.org a clickable link.                                                                                                                      | FAQ #9 links to https://armypink.org/ in a new tab.                                                                                                                       |
| 3a  | FAQ #7 should reflect the analytics requirements.                                                                                                        | Added to FAQ #7: "We count aggregate, anonymous usage, such as which rooms are visited, to improve the Portal. We never collect who you are or what you write or create." |
| 5   | Remove the redundant emergency box under the FAQ.                                                                                                        | Removed; the hotline stays in FAQ #4 and #8.                                                                                                                              |
| 6   | Button names approved: Continue Without Saving (before enabling), Turn Saving Off (after).                                                               | Already in place (AP-21).                                                                                                                                                 |
| 7   | Saving wording and "Saving on this device" approved. "Nothing is measured today" must change. "Session video is not available yet" approved.             | Approval tags removed. The measurement section is rewritten to describe aggregate analytics.                                                                              |
| 8   | Remove the simulated PIN screen for launch.                                                                                                              | Removed from the Journals and Toolkit, with all "Simulated PIN" badges. Real PIN protection is a possible future phase.                                                   |
| 9   | Spanish only after review by a qualified, fluent (ideally native) speaker familiar with survivor-support terms; until then, show Spanish as Coming Soon. | Launch in English. The toggle shows "ES · pronto", disabled. Turn it on with `SPANISH_ENABLED` in `src/lib/prefs.tsx` after TR-06.                                        |
| 10  | Keep weather.com as the Quick Exit destination.                                                                                                          | No change.                                                                                                                                                                |
| 11  | Make clear that turning saving off does not delete saved items.                                                                                          | In place: "Stops future saves. Items you already saved stay on this device until you delete them." The D5 dialog also offers deletion separately.                         |
| 12  | Hold the Spanish introduction for native-speaker review.                                                                                                 | Covered by #9; no Spanish is shown.                                                                                                                                       |

## Analytics verification (founder's item 3)

**Before this change:** no analytics were active. `track()` was an empty function, no analytics package was installed, and the security policy (`connect-src 'self'`) blocks any request to another site. Nothing was transmitted.

**After this change:** Vercel Web Analytics plus custom events, active only on the deployed site (never locally or in tests).

**What is sent, and where:**

- **Destination:** first-party paths on the Portal's own domain (Vercel's intake). No third-party domain, no Google Analytics.
- **Page views (automatic):** page address with query strings and `#` fragments stripped by our `beforeSend`, referrer, device type, browser and OS, approximate location (country/region/city level as Vercel reports it) and a timestamp.
- **Identification:** no cookies. Vercel identifies a visit with a hash of the request that it discards after 24 hours, so there is no persistent identifier.
- **Custom events:** only these names, each with only the listed category values. Anything else is dropped before sending (`src/lib/analytics.ts`, tested in `src/lib/analytics.test.ts`).

| Founder's allowed category | Events                                                                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visits, navigation         | Page views; `landing_opened`                                                                                                                                                                                           |
| Rooms and resources viewed | `recovery_room_opened` (room), `recovery_exercise_started` (room), `calm_media_opened` (media), `library_opened`, `library_category_opened` (category), `library_resource_opened` (category), `opportunity_*`, `art_*` |
| Language selection         | `language_english_selected`, `language_spanish_selected`                                                                                                                                                               |
| Saves and deletes          | `save_action` (room, kind), `save_deleted` (one or all)                                                                                                                                                                |
| Quick Exit usage           | `quick_exit_selected`                                                                                                                                                                                                  |
| Technical errors           | `error_occurred` (code, e.g. `storage-quota`, `page-error`)                                                                                                                                                            |
| Other engagement           | `calm_media_play` / `pause`, `calm_captions_toggled`, `external_link_selected`, `accessibility_control_used` (control)                                                                                                 |

**Never sent:** names, contact details, client/ride/case information, IDs, journal entries, artwork, free text, searches, precise location. Values must be short lowercase categories (`journals`, `reflection`), which blocks free text by construction.

**Still to confirm:**

- **Custom events need the Vercel Pro plan.** On the free plan, only page views are collected.
- **IP addresses:** Vercel's documentation says the data is "not tied to any individual... or IP address" but does not state whether IPs are stored at the server level. If that matters for compliance, confirm with Vercel's DPA or privacy contact.
- **Before launch:** check the live deployment's network requests once (part of REL-01a).

## Anonymous Survivor Art Gallery: remaining work and timeline (founder's item 2)

Sharing can't be done for 30 November. Today the gallery is a concept page and nothing can leave the device by design. Sharing needs a small server-side service, which the current architecture deliberately does not have (decision D7).

| Work                                                                                                                          | Estimate                     |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Choose the service (e.g. Supabase or Vercel Blob plus a Vercel Function) and complete a privacy review                        | 4 h + founder sign-off       |
| Submission endpoint: size and type checks, strip image metadata, rate limiting, no IP logging                                 | 10 h                         |
| Moderation: staff-only review screen with sign-in, approve or reject, takedown                                                | 10 h                         |
| Public gallery page showing approved artwork only                                                                             | 4 h                          |
| Art Room share flow: consent step, preview of what is shared, success and failure messages, sharing kept separate from saving | 6 h                          |
| Security policy update, abuse handling, tests and privacy verification                                                        | 8 h                          |
| FAQ #5, #7 and privacy page wording                                                                                           | 1 h + approval               |
| **Total**                                                                                                                     | **About 43 developer hours** |

At about 13 team hours a week, that is 3–4 weeks of the whole team's time. The 30 November launch still needs the deployment, release checklist and final QA. Sharing also depends on the full Art Room (about 36 h), since that is where artwork is made.

**Recommended:** launch on 30 November with the current, accurate FAQ #5. Then build the full Art Room and gallery sharing together, targeting **29 January 2027**.

Conditions:

- the founder approves D7 by **5 December**
- someone is named to moderate submissions

Release 1.1 then moves to about March 2027. The alternative, delaying the whole launch for sharing, would put launch around late January because of the holiday break.
