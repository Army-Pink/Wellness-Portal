import { choose, expect, test } from "./fixtures";

test("home FAQ lists the founder's 9 questions in order", async ({ page }) => {
  await choose(page, "Continue Without Saving");
  await page.goto("/");
  const summaries = page.locator("section[aria-labelledby=faq-h] summary");
  await expect(summaries).toHaveCount(9);
  const expected = [
    "1. Do I need an account to use the Portal?",
    "2. Is anything I do here saved?",
    "3. What does Quick Exit do?",
    "4. What if I need help right now?",
    "5. Is my artwork private?",
    "6. Can I save or download my artwork?",
    "7. Can anyone see what I do in the Portal?",
    "8. Does the Portal provide crisis support or professional services?",
    "9. Where can I learn more about Army Pink?",
  ];
  for (const [i, text] of expected.entries()) await expect(summaries.nth(i)).toContainText(text);
});
