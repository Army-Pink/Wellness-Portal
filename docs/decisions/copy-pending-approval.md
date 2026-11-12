# Survivor-facing copy pending founder approval

Drafted 2026-10-18 by engineering. **Not final.** Spanish is a draft that needs review by a native speaker.
To approve: tick the box, or edit the text and note the change here, then update the source file.

## D5 — Turning saving off while items exist

Source: `src/components/portal/PrivacyChoice.tsx`, `src/lib/es.ts`

|            | English (draft)                                                                                                 | Spanish (draft)                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [ ] Title  | What should happen to your saved items?                                                                         | ¿Qué quieres hacer con tus elementos guardados?                                                                                             |
| [ ] Body   | New items will not be saved. Items you already saved stay in this browser on this device until you delete them. | No se guardarán elementos nuevos. Los elementos que ya guardaste permanecen en este navegador, en este dispositivo, hasta que los elimines. |
| [ ] Button | Keep my saved items                                                                                             | Conservar mis elementos guardados                                                                                                           |
| [ ] Button | Delete them now → second step: "Permanently delete all saved items?" / "Delete permanently"                     | Eliminarlos ahora → «¿Eliminar permanentemente…?» / «Eliminar permanentemente»                                                              |

## D4 — Esc key no longer exits while typing or with a dialog open

|     | Where                               | English (draft)                                                                                                                                                 | Spanish (draft)                                                                                                                                                          |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ ] | Intro step 2 (`Intro.tsx`)          | Tap "Quick exit" (top corner) anytime to leave instantly for a neutral page. When you aren't typing, you can also press the Esc key.                            | Toca "Salida rápida" (en la esquina) en cualquier momento para ir de inmediato a una página neutral. Cuando no estés escribiendo, también puedes presionar la tecla Esc. |
| [ ] | Home FAQ (`routes/index.tsx`)       | Quick Exit (or the Esc key, when you aren't typing) immediately leaves the Portal and opens a neutral website. It does not erase your browser history.          | _(FAQ answers are untranslated; they need approval first)_                                                                                                               |
| [ ] | Privacy page (`routes/privacy.tsx`) | The Esc key does not leave while you are typing, drawing or have a window open, so a stray key press cannot lose your work. The Quick Exit button always works. | _(page not yet translated)_                                                                                                                                              |
| [ ] | Footer (`Shell.tsx`)                | No sign-up. No profiles. No trackers. Use Quick Exit or press Esc to leave.                                                                                     | _(footer not yet translated)_                                                                                                                                            |

## AP-20 — Footer line and About Army Pink link

Source: `src/components/portal/Shell.tsx`. The link is already on the page. These two sentences still need founder sign-off. There is no approved Spanish, so English is shown.

|     | Where                | English (draft)                         | Spanish (draft)                               |
| --- | -------------------- | --------------------------------------- | --------------------------------------------- |
| [ ] | Footer (`Shell.tsx`) | About Army Pink                         | _(no approved translation; English is shown)_ |
| [ ] | Footer (`Shell.tsx`) | Part of Army Pink's Pathway to Freedom. | _(no approved translation; English is shown)_ |

## Also pending

- [ ] Quick Exit destination: currently `https://www.weather.com` (`QUICK_EXIT_URL` in `Shell.tsx`)
- [ ] All FAQ answers on the home page (currently tagged "Needs approval"); now the brief's 9 answers, see AP-19 above

Fixed along the way: the Spanish translation of the intro's Quick Exit line never displayed, because its dictionary key didn't match the English text.

## New draft Spanish for the intro (previously English-only in Spanish mode)

- [ ] Get Started, You have found a safe space., Take a breath., There's no rush here., You're all set., However you arrived today, you're welcome here., Enter the portal, Watch the introduction video, Sometimes, life can feel overwhelming., Back to the portal. See `src/lib/es.ts` ("Intro" block). The wording is gender-neutral on purpose ("aquí te damos la bienvenida").
- `src/test/translations.test.ts` now fails if an Intro or Privacy Choice string loses its Spanish entry.

## Added 26 October 2026: from the founder's final brief

The founder's final FAQ wording is in [`founder-brief-2026-10-26.md`](founder-brief-2026-10-26.md). It replaces the earlier FAQ drafts above. These points still need a decision:

**AP-19 status (home FAQ, `src/lib/faq.ts`):** the 9 Q&As now use the brief's wording in the brief's order. #3 and #5 are live with the wording below but stay **pending approval**. The other seven are the brief's own text. The FAQ keeps its "answers need approval" tag until the items below are decided. Answers stay untranslated (English is shown in Spanish mode).

- [ ] **FAQ #3 vs D4 (pending, decision #22).** The brief says "You can also press Esc to activate Quick Exit." Today Esc is ignored while typing, drawing or with a dialog open. Recommended: add "when you aren't typing". Alternative: make Esc always exit. **Currently live: the brief's wording ("You can also press Esc to activate Quick Exit."), which is not accurate while typing, drawing or with a dialog open.** Needs a decision before launch.
- [ ] **FAQ #5 (artwork sharing; interim wording, pending, decision #24).** Gallery sharing is not built yet (decision D7). Proposed interim answer: "Your artwork stays private on this device. Sharing to the Anonymous Survivor Art Gallery isn't available yet; when it is, you'll always choose first and see what will be shared."
- [ ] **FAQ #7.** Must match real behavior: no analytics are switched on and nothing leaves the device today.
- [ ] **Simulated PIN lock** in Journals and Toolkit. Recommended: remove it for launch (the brief asks for prototype-only features to go).
- [ ] **Saving labels.** Rename to the brief's terms: Save on This Device, Continue Without Saving, Turn Saving Off, Download My Saved Items.

## AP-07b — My Saved Items: error messages (draft Spanish)

Source: `src/lib/es.ts`. Short interface strings; English is the existing wording from the app. Needs native-speaker review.

|     | English (existing)                                                                                                          | Spanish (draft)                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ ] | Browser storage is unavailable or full. Nothing new was saved. You can continue using every Portal activity without saving. | El almacenamiento del navegador no está disponible o está lleno. No se guardó nada nuevo. Puedes seguir usando todas las actividades del Portal sin guardar. |
| [ ] | Could not delete saved items. They may still be in this browser. Please try again.                                          | No se pudieron eliminar los elementos guardados. Es posible que sigan en este navegador. Inténtalo de nuevo.                                                 |
| [ ] | Could not export your collection. Please try again.                                                                         | No se pudo exportar tu colección. Inténtalo de nuevo.                                                                                                        |
