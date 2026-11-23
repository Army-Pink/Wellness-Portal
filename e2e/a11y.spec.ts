import AxeBuilder from "@axe-core/playwright";
import { choose, expect, test } from "./fixtures";

/** Same surface as anonymous navigation: every visitor-facing route. */
const routes = [
  "/",
  "/art-room",
  "/gallery",
  "/calm-room",
  "/calm-room/breath",
  "/recovery-rooms",
  "/recovery-rooms/crisis",
  "/library",
  "/library/self-care",
  "/resource/self-care-1",
  "/not-broken",
  "/not-broken/module-1",
  "/opportunities",
  "/partners",
  "/partner-sessions",
  "/journals",
  "/decision-support",
  "/toolkit",
  "/saved-items",
  "/privacy",
];

function seriousOrCritical(
  violations: {
    id: string;
    impact?: string | null;
    help: string;
    nodes: { target: unknown[] }[];
  }[],
) {
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      targets: v.nodes.flatMap((n) => n.target),
    }));
}

test.describe("accessibility (axe)", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss the first-visit intro so axe scans the real page, not the overlay.
    await choose(page, "Continue Without Saving");
  });

  for (const route of routes) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("#main")).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      expect(seriousOrCritical(results.violations), `axe serious/critical on ${route}`).toEqual([]);
    });
  }
});
