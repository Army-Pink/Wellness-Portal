import { afterEach, describe, expect, it } from "vitest";
import { shouldQuickExitOnKey } from "@/components/portal/Shell";

const esc = () => new KeyboardEvent("keydown", { key: "Escape", cancelable: true });

afterEach(() => {
  document.body.innerHTML = "";
});

// Founder, 24 Nov 2026: Esc is a safety shortcut and works everywhere.
describe("Quick Exit Esc key", () => {
  it("exits on Esc from the page", () => {
    expect(shouldQuickExitOnKey(esc())).toBe(true);
  });
  it("ignores other keys", () => {
    expect(shouldQuickExitOnKey(new KeyboardEvent("keydown", { key: "Enter" }))).toBe(false);
  });
  it("still exits when a dialog is open", () => {
    document.body.innerHTML = '<div role="alertdialog"></div>';
    expect(shouldQuickExitOnKey(esc())).toBe(true);
  });
  it.each(["<textarea></textarea>", '<input type="text">', "<canvas tabindex=0></canvas>"])(
    "still exits while %s has focus",
    (html) => {
      document.body.innerHTML = html;
      (document.body.firstElementChild as HTMLElement).focus();
      expect(shouldQuickExitOnKey(esc())).toBe(true);
    },
  );
  it("still exits when another handler already handled Esc", () => {
    const e = esc();
    e.preventDefault();
    expect(shouldQuickExitOnKey(e)).toBe(true);
  });
});
