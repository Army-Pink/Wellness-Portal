import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { es } from "@/lib/es";
import esCatalog from "@/content/i18n/es.json";

// Spanish lookups are keyed by the exact English string, so an edited English
// line silently loses its translation. Guard the safety-critical screens.
const intro = readFileSync("src/components/portal/Intro.tsx", "utf8");
const privacy = readFileSync("src/components/portal/PrivacyChoice.tsx", "utf8");
const literals = (src: string) =>
  [...src.matchAll(/tx\(\s*(["'])((?:\\.|(?!\1).)+)\1\s*,?\s*\)/g)].map(([, , s]) =>
    s!.replace(/\\(["'])/g, "$1"),
  );

describe("draft Spanish coverage", () => {
  it.each([
    ["Intro", intro],
    ["PrivacyChoice", privacy],
  ])("every %s string has a Spanish entry", (_name, src) => {
    const missing = literals(src).filter((s) => !(s in es));
    expect(missing).toEqual([]);
  });
});

// Files moved to typed keys: every t("key") they use needs a draft Spanish entry.
// AP-21 labels from the founder's brief: no approved Spanish yet, so English shows in Spanish mode.
const NO_APPROVED_SPANISH = new Set([
  "notice.translationPending",
  "saved.download",
  "saved.turnSavingOff",
  "saved.saveOnDevice",
  "privacy.turnSavingOff",
  "privacy.turnSavingOffHelp",
]);
const keysIn = (src: string) =>
  [...src.matchAll(/\bt\(\s*"([a-z][A-Za-z0-9.]+)"/g)].map((m) => m[1]!);
describe("typed-key Spanish coverage", () => {
  it.each([
    ["PrivacyChoice", privacy],
    ["Shell", readFileSync("src/components/portal/Shell.tsx", "utf8")],
    ["saved-items", readFileSync("src/routes/saved-items.tsx", "utf8")],
  ])("every %s key has a Spanish entry", (_name, src) => {
    const catalog = esCatalog as Record<string, string>;
    const missing = keysIn(src).filter((k) => !NO_APPROVED_SPANISH.has(k) && !catalog[k]);
    expect(missing).toEqual([]);
    expect(keysIn(src).length).toBeGreaterThan(0);
  });
});
