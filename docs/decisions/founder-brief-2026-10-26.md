# Founder's final brief: FAQ, privacy, safety and the Army Pink website (26 October 2026)

Summary of the founder's _Final Developer Brief_, kept here so developers have the exact FAQ wording. How the brief changes the plan (tickets AP-19 to AP-22, decisions D4 and D7) is in [`../technical-plan.md`](../technical-plan.md), section "Founder's brief of 26 October".

**Core rule:** all visitor-facing language must accurately reflect what has actually been implemented and tested.

## FAQ: final order and wording (AP-19)

1. **Do I need an account to use the Portal?** No. There is no sign-up and no profile. You can use the Portal without sharing who you are.
2. **Is anything I do here saved?** Your activity is not automatically saved. You can choose whether to save supported items on this device. Saved items remain on this device and browser unless you delete them or they are otherwise removed. Closing the page does not necessarily delete saved items. Your visit trail and other temporary activity may not persist after you close the page.
3. **What does Quick Exit do?** Quick Exit takes you away from the Portal to a neutral website. You can also press Esc to activate Quick Exit. Quick Exit is designed to help you leave the Portal quickly. It does not necessarily erase browser history, downloads, or other traces of your visit. _(D4: wording about Esc pending.)_
4. **What if I need help right now?** If you're in immediate danger, call 911. To reach the National Domestic Violence Hotline, call 1-800-799-7233 or text START to 88788.
5. **Is my artwork private?** Your artwork remains private unless you choose to share it. When you choose to share artwork in the Art Room, it may be submitted to the Anonymous Survivor Art Gallery according to the Portal's sharing process. Before sharing, you should understand what will be shared and how it may be displayed. _(D7: do not publish until gallery sharing is built and verified; use the interim wording in `copy-pending-approval.md`.)_
6. **Can I save or download my artwork?** Yes. You can choose to save supported items on this device. You can also download your saved items so you can keep a copy for yourself. The download is designed to include your saved artwork images, readable text files, and a simple index in a ZIP archive. The download should be generated locally in your browser without uploading your saved collection to a server.
7. **Can anyone see what I do in the Portal?** The Portal is designed to let you explore without creating an account or profile. What remains on your device, what is shared, and what information may be collected depend on the features you use. Choosing to save something on your device is different from choosing to share artwork with the Anonymous Survivor Art Gallery.
8. **Does the Portal provide crisis support or professional services?** The Wellness Portal offers spaces for reflection, creative expression, and wellness. It does not replace emergency services, professional care, or support from a trusted advocate. If you need immediate help, call 911. You can also contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788.
9. **Where can I learn more about Army Pink?** The Wellness Portal is part of Army Pink's work to support survivors. If you would like to learn more about Army Pink and its programs, visit armypink.org. Visiting the main website is optional. You can continue using the Wellness Portal without leaving it.

## Connection to the Army Pink main website (AP-20)

- A discreet **About Army Pink** text link in the footer or About area, pointing to https://armypink.org/.
- An optional, gentle line saying the Portal is part of Army Pink's Pathway to Freedom and offers spaces for reflection, creative expression, and wellness.
- Never redirect visitors, require a visit, or interrupt their use of the Portal. The Portal must work from a direct link, with no account or identifying information.

## Saving terms (AP-21)

| Term                    | Meaning                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| Save on This Device     | Supported items can be saved locally                                           |
| Continue Without Saving | Continue without intentionally saving items                                    |
| Turn Saving Off         | Stops future saves; previously saved items stay until the visitor deletes them |
| Download My Saved Items | ZIP with artwork images, readable text files and a simple index (AP-08b)       |

## Anonymous Survivor Art Gallery (D7, AP-22)

The founder intends visitors to be able to share artwork to the gallery. Verification items from the brief:

1. Selecting share starts the gallery submission.
2. The visitor sees whether submission succeeded or failed.
3. Saving locally never submits to the gallery.
4. The visitor understands what will be shared and how it may appear.
5. Anonymity claims match real data handling.
6. Save, download and share work independently.

## Quick Exit and safety

- Quick Exit and Esc work as specified, with a neutral destination.
- Never claim browser history, downloads, saved items or network records are erased.
- Test keyboard behavior, mobile layouts and interaction with other controls. The exit control stays accessible throughout.
- Emergency and hotline information stays easy to find. Never imply the Portal provides emergency response or live crisis intervention.

## Final QA checklist (REL-01a)

- [ ] FAQ questions numbered 1–9 in the order above
- [ ] Hotline information appears once per answer without duplicated wording
- [ ] Main website link points to https://armypink.org/
- [ ] The website link is optional and does not interrupt Portal use
- [ ] Saving behavior matches the Privacy / Your Choice screen
- [ ] Turning saving off stops future saves without silently deleting existing items
- [ ] Download My Saved Items produces the intended ZIP contents
- [ ] ZIP generation does not upload the saved collection to a server
- [ ] Artwork sharing is distinct from private saving
- [ ] Gallery submission, feedback and anonymity claims are verified
- [ ] Quick Exit and Esc work as described
- [ ] All privacy and safety language matches tested functionality
- [ ] Prototype-only statements are removed or updated before features are represented as live
