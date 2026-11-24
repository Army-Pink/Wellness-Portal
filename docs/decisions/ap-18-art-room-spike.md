# AP-18: Art Room spike

Written 24 November 2026. Chooses the drawing approach for the full Art Room (AP-16) and splits the build into tickets of 5 hours or less. Sharing to the gallery is separate: see `docs/decisions/ap-22-gallery-sharing-spike.md`.

## What exists today

The Art Room page (`src/routes/art-room.tsx`) already has a working drawing area:

- Drawing with a finger, pen or mouse (pointer events), seven colours, three brush sizes, eraser, undo (up to 30 steps) and clear.
- Three stages (Why I Left, Where I Am, Where I'm Going) with placeholder prompts.
- "Save on This Device" through the shared save control. The picture is stored as a PNG data URL inside the saved item.
- A carousel of placeholder pictures that already respects reduced motion.

## Recommendation

**Keep the current plain canvas** and make it dependable, rather than add a drawing library. It is small, has no new dependencies, and sends nothing anywhere. Add what is missing:

1. **A keyboard way to draw.** A focus point on the canvas that moves with the arrow keys; Space lifts or lowers the pen; Shift moves faster. The position and pen state are announced to screen readers. This is the acceptance criterion in AP-16.
2. **A second way to make art without drawing.** A small set of colour and shape stamps that can be placed with a tap or the keyboard. This helps people who cannot draw freehand or find it hard to start. The shapes are plain (circle, square, line, wave); no wording is invented.
3. **Reduced motion.** The canvas has no animation, but the stage changes and the carousel must follow both the Portal's setting and the browser's setting, and have a test.
4. **A steadier canvas.** Today the canvas is sized once when the page opens, so it can break when the window is turned or resized. It keeps one picture for all three stages, and each undo step stores a full copy of the picture. These need fixing before sharing, because a shared image must look like the visitor's drawing.
5. **One picture per stage, then a review.** Each stage keeps its own drawing. A final screen shows the three together, and the visitor can save each one.
6. **Images stored as Blobs** (an AP-16 criterion). Pictures are currently stored as text (data URLs, about 1.37 times larger). Storing the picture itself in the browser's database is smaller and faster. This changes the saved-item format, so it needs a version number and a migration for items already saved. It also changes how the ZIP download reads pictures. It is the riskiest ticket; do it on its own.

**Not recommended:** a third-party drawing library (new code to trust, no real gain), or recording strokes as video (not needed).

## Tickets (none over 5 hours)

| ID   | Ticket                                                                                                      | Hours  |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------ |
| AR-1 | Steadier canvas: resize-safe, sharp on high-density screens, cancelled touches handled, lighter undo        | 5      |
| AR-2 | One drawing per stage kept while moving between stages                                                      | 3      |
| AR-3 | Keyboard drawing: moving focus point, pen up and down, step sizes, screen reader announcements              | 5      |
| AR-4 | Colour and shape stamps as a second way to make art, usable by keyboard                                     | 4      |
| AR-5 | Reduced motion for the Art Room, stage changes and carousel; tests for the Portal setting and the browser's | 3      |
| AR-6 | Mobile tuning: palm rejection, large controls, turning the phone, mobile browser tests                      | 4      |
| AR-7 | Review screen showing the three drawings with Save on each                                                  | 4      |
| AR-8 | Store pictures as Blobs: version bump, migration of saved items, ZIP download reads Blobs                   | 5      |
| AR-9 | Put approved prompts and wording in place (waits for the content team; no text is invented)                 | 2      |
|      | **Total**                                                                                                   | **35** |

This matches the plan's "about 36 hours including the spike" within an hour. AR-1 to AR-3 come first because sharing depends on a dependable picture. Sharing tickets S4 and S5 (consent step and keeping sharing apart from saving) sit after AR-7, because the share button lives on the review screen.

## Rules for every ticket

- Nothing drawn is sent anywhere. Saved pictures stay in the browser, as today.
- The Art Room stays reachable and usable without sharing. Visitor-facing wording changes in the same pull request as the behaviour.
- Prompts and any survivor-facing text stay as marked placeholders until approved. Do not invent clinical or creative-writing content.
- Every ticket needs a browser test on desktop and mobile, and an axe check.

## Open questions

- [ ] Content team: who writes the three stage prompts, and by when? (AR-9)
- [ ] Founder: is the shape and stamp set (AR-4) wanted, or only free drawing and a keyboard mode?
- [ ] Team lead: build order with sharing, given launch is 30 November and the Art Room ships after it.
