# D7: Gallery sharing through a small managed service

**Decision (founder, 24 November 2026):** artwork sharing to the Anonymous Survivor Art Gallery will use a small Vercel storage service, with a named moderator checking every image. The founder wants sharing built and is working on getting Vercel Pro access.

**Agreed**

- One small managed service on Vercel (storage plus a small function), image only. Final choice and privacy review come first (AP-22).
- Every image is reviewed by a person before anyone can see it.
- A moderator is named by the founder.
- Consent, a preview of what is shared, and clear success or failure messages. Sharing stays separate from private saving.

**Launch order (team lead, 24 November 2026):** the Portal launches on 30 November 2026 without sharing, with the current accurate FAQ #5. Sharing is built next, together with the Art Room, and ships when the Vercel plan, the service and the moderator are in place. Target: early 2027 (the plan says 29 January 2027). Reason: about 43 hours of sharing work plus the full Art Room (about 36 hours) does not fit in the 13 team hours of launch week.

**Until Vercel Pro is available** the team can do work that needs no paid service: the service and privacy review, the consent and preview screens built against a stand-in that sends nothing, the moderation screen design, and the written rules for what is kept and for how long.

**Rules that stay in force**

- Saved items never leave the device. Only an image the visitor explicitly chooses to share is sent, after a consent step.
- No names, accounts, contact details or IP logging attached to a submission.
- Every visitor-facing sentence about sharing must match tested behavior, and no wording says sharing works until it does.
- Any change to the security policy, the privacy page or FAQ #5 and #7 goes through the founder's approval first.

**Spanish:** unchanged. Spanish stays shown as "ES · pronto" (coming soon) until a qualified translator has reviewed it. No Spanish work is planned for this change.

**Still open**

- [ ] Vercel Pro access (founder)
- [ ] Moderator named (founder)
- [ ] Service chosen and privacy review done (AP-22, #44)
- [ ] Final wording for the gallery page, FAQ #5 and #7, and the privacy page (founder approval)

See `docs/decisions/founder-response-2026-11-24.md` for the original estimate and `docs/technical-plan.md`, section 9.
