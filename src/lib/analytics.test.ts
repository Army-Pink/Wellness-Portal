import { describe, expect, it } from "vitest";
import { ALLOWED_PROPS, analyticsEnabled, beforeSend, sanitizeEvent, track } from "./analytics";

describe("analytics allowlist (founder's specification)", () => {
  it("allows a known event with short category values", () => {
    expect(sanitizeEvent("save_action", { room: "journals", kind: "reflection" })).toEqual({
      room: "journals",
      kind: "reflection",
    });
    expect(sanitizeEvent("quick_exit_selected")).toEqual({});
  });
  it("drops unknown events", () => {
    expect(sanitizeEvent("search_performed", {})).toBeNull();
  });
  it("drops unknown property keys", () => {
    expect(sanitizeEvent("save_action", { room: "journals", text: "x" })).toBeNull();
  });
  it.each([
    ["free text", "I left on Tuesday"],
    ["an email", "someone@example.com"],
    ["a phone number", "555 123 4567"],
    ["a long value", "a".repeat(41)],
    ["uppercase", "Journals"],
  ])("drops %s as a property value", (_label, value) => {
    expect(sanitizeEvent("save_action", { room: value })).toBeNull();
  });
  it("only lets events carry categories, never content keys", () => {
    const keys = Object.values(ALLOWED_PROPS).flat();
    for (const banned of ["text", "title", "name", "email", "id", "query", "search", "image"])
      expect(keys).not.toContain(banned);
  });
  it("strips query strings and fragments from URLs", () => {
    expect(
      beforeSend({ type: "pageview", url: "https://portal.example/journals?note=secret#x" }),
    ).toEqual({ type: "pageview", url: "https://portal.example/journals" });
  });
  it("drops events with an unparseable URL", () => {
    expect(beforeSend({ type: "event", url: "not a url" })).toBeNull();
  });
  it("is off outside the deployed site, so tests and local runs send nothing", () => {
    expect(analyticsEnabled()).toBe(false);
    expect(() => track("save_action", { room: "journals", kind: "reflection" })).not.toThrow();
  });
});
