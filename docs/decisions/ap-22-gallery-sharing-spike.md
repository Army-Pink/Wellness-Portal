# AP-22: Gallery sharing spike

Written 24 November 2026. This is a recommendation for the founder to approve, not a decision. It follows the D7 agreement in `docs/decisions/d7-gallery-sharing-approval.md`.

## Recommendation in one paragraph

Use **Vercel Blob** for images and **one Vercel Function** for uploads and moderation, with no separate database. Visitors send artwork **through our own function**, so the browser only ever talks to the Portal's own address and the security policy needs no new site. Pending images sit in a private area. A moderator signs in, approves or rejects, and only approved images are shown in the gallery. The build is about **46 hours in 12 tickets of 5 hours or less**, on top of the Art Room itself. It needs a paid Vercel plan, the moderator, and the founder's approval of the privacy points below.

## Why this service

| Option                                  | Good                                                                                                                                          | Not so good                                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vercel Blob plus a Vercel Function**  | Same company as our hosting, one dashboard, nothing new to sign up for. Files stay behind our own address if uploads go through the function. | Storage and bandwidth are billed by use on Pro. No built-in sign-in, so we write a small moderator login.                                                                                                          |
| **Supabase** (storage, database, login) | Has built-in sign-in and a database, so moderation is easier to build.                                                                        | A second company and dashboard to secure. The free plan has 1 GB of file storage, and free projects pause after a week of low activity, so it is not suitable for a live gallery without the $25 a month Pro plan. |
| Something else (own server, S3)         | Full control.                                                                                                                                 | Most work and most to secure; not a small managed service. Not recommended.                                                                                                                                        |

**Plan and cost**

- Vercel's free Hobby plan is for non-commercial personal use. Its published rules have no nonprofit exemption, and the test they describe is whether anyone involved gains financially. Whether the Army Pink Portal qualifies is **unconfirmed**. The founder's Pro request, or a question to Vercel, settles it. We should not assume Hobby is allowed.
- Blob on Hobby includes 1 GB of storage, with no paid overage: access is blocked once limits are hit. On Pro, Blob is billed on use. A third-party summary gives about $0.023 per GB stored, which is small for artwork, but **confirm on Vercel's pricing page before quoting any cost to the founder.**
- Custom analytics events also need Pro, so Pro serves both needs.

## How it would work

1. **Share step in the Art Room.** After drawing, the visitor can choose "Share to the gallery", separate from "Save on This Device". A consent screen shows the exact picture that would be sent and says what is and is not shared. Nothing is sent before the visitor presses the final button.
2. **Upload.** The browser sends the image to our own function (same address, so `connect-src 'self'` is unchanged). The function checks the file type and size, re-encodes the picture so no hidden data survives, gives it a random name, and stores it as **pending**. No name, account, email or free text is collected.
3. **Feedback.** The visitor sees a clear "sent for review" or "did not send" message. We never say "published", because a person has not approved it yet.
4. **Moderation.** The moderator signs in to a staff-only screen, sees pending images one at a time, and approves or rejects each. A rejected image is deleted. Approved images become visible.
5. **Gallery.** The public gallery lists approved images only. It shows no dates, places or other details.
6. **Takedown.** The moderator can remove any approved image at any time.

**Keeping sharing apart from saving.** Saved items never leave the device. The share button sends only the one image the visitor chose to share, after consent. The existing wording "artwork is never sent to the gallery" must change in the same pull request that makes sharing real.

**Storage layout without a database.** Two Blob areas: `pending/` (private) and `approved/` (public, random names). Approving moves the file. There is no table to secure or back up.

## Privacy review notes

These are the points the founder must see before approving.

| Point                      | Finding                                                                                                                                                              | Proposed handling                                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is collected          | The image only, plus a random ID and an approved or pending state.                                                                                                   | Nothing else is stored. No names, accounts, cookies or free text.                                                                                                                   |
| Hidden data in images      | Drawings come from the Art Room canvas, so they carry none today. A visitor could still send a different file.                                                       | The function re-encodes every upload and accepts one image type only.                                                                                                               |
| IP addresses               | Our promise of "no IP logging" **cannot be fully kept** on a hosting platform: Vercel may record request addresses in its own platform logs. We do not control that. | Our code never stores or logs an address. Before launch, confirm with Vercel what its logs keep and for how long, and word the privacy page to match exactly. **Founder decision.** |
| Identifying content in art | A picture can contain a face, a name, an address or the abuser's details, even if the visitor means well.                                                            | The moderator checks for this. The consent screen warns the visitor not to include names or places. The moderator needs written rules and training. **Founder to supply.**          |
| Withdrawing after sharing  | With no accounts, a visitor has no way to ask for removal. This matters for a survivor who changes their mind.                                                       | Proposal: show a one-time "removal code" at upload. The code is kept only as a hash. Entering it removes the image. This needs founder approval and is its own ticket (S8).         |
| Public gallery visitors    | Gallery pages may be viewed by anyone, including an abuser.                                                                                                          | The gallery has no search, dates or places. Quick Exit and Esc work there too.                                                                                                      |
| Abuse and spam             | Anyone could upload harmful or unrelated images.                                                                                                                     | Review before anything is public, a size limit, and rate limiting. What rate limiting Vercel offers on our plan is **to be confirmed** in S3.                                       |
| Moderator safety           | The moderator will see distressing images.                                                                                                                           | Founder to name someone suitable and agree support for them. Out of scope for code.                                                                                                 |
| Moderator login            | Vercel Blob has no built-in sign-in.                                                                                                                                 | A single protected staff screen with a strong secret kept in Vercel's settings, never in the code. Detailed design in S6.                                                           |
| Wording                    | FAQ #5 and #7 and the privacy page must describe all of the above accurately.                                                                                        | Draft after the founder answers the points above. The founder approves the final text. Do not ship before it is approved.                                                           |

## Build estimate: 12 tickets, none over 5 hours

| ID  | Ticket                                                                                       | Hours  |
| --- | -------------------------------------------------------------------------------------------- | ------ |
| S1  | Create the Blob store and function project settings; confirm the plan and the storage layout | 3      |
| S2  | Upload function: check type and size, re-encode, random name, store as pending               | 5      |
| S3  | Upload function: rate limiting, no content or addresses in logs, unit tests                  | 4      |
| S4  | Art Room share step: consent screen, preview of what is sent, success and failure messages   | 5      |
| S5  | Keep sharing separate from saving; update the "never sent" wording; accessibility tests      | 3      |
| S6  | Moderator sign-in (secret in settings, signed session, lockout)                              | 5      |
| S7  | Moderation screen: list pending, approve, reject                                             | 5      |
| S8  | Takedown by moderator and visitor removal code                                               | 4      |
| S9  | Public gallery showing approved images only                                                  | 4      |
| S10 | Security policy and header review; browser tests that nothing else leaves the Portal         | 4      |
| S11 | FAQ #5, #7 and privacy page wording after founder approval                                   | 1      |
| S12 | Abuse handling notes and a full rehearsal: share, approve, show, remove                      | 3      |
|     | **Total**                                                                                    | **46** |

This is 3 hours more than the 43 hours estimated on 24 November, because moderator sign-in and removal were split out. It does not include the Art Room (about 36 hours), which makes the artwork. The Art Room and S4 share the same screen, so build them together.

**What can start before Vercel Pro:** S4 and S5 against a stand-in that sends nothing, the S11 wording draft, the moderator rules, and the questions to Vercel. **What needs Pro and the moderator:** S1 to S3 and S6 to S10 on the live service.

## Decisions needed

- [ ] Founder: approve Vercel Blob plus a Vercel Function, and the Pro plan.
- [ ] Founder: decide the IP-address wording after Vercel confirms what its logs keep.
- [ ] Founder: approve the visitor removal code (S8).
- [ ] Founder: name the moderator and agree the moderation rules.
- [ ] Team lead: ask Vercel whether the Portal qualifies for the free plan, or confirm Pro.

## Sources

- [Vercel Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Supabase pricing](https://supabase.com/pricing)

Figures were read from search summaries on 24 November 2026 and are not yet checked against the live pages. Re-check them before relying on any cost.
