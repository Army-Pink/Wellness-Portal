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

test("armypink.org in FAQ #9 is an optional link, and there is no duplicate emergency box", async ({
  page,
}) => {
  await choose(page, "Continue Without Saving");
  await page.goto("/");
  const faq = page.locator("section[aria-labelledby=faq-h]");
  await faq.locator("summary").nth(8).click();
  const link = faq.getByRole("link", { name: "armypink.org" });
  await expect(link).toHaveAttribute("href", "https://armypink.org/");
  await expect(link).toHaveAttribute("target", "_blank");
  // The hotline appears inside FAQ #4 and #8 only, not in a separate box below.
  await expect(page.getByText("To reach the National Domestic Hotline")).toHaveCount(0);
});

test("Spanish is shown as coming soon and cannot be selected yet", async ({ page }) => {
  await page.goto("/privacy");
  const es = page.getByRole("button", { name: /Spanish coming soon/ }).first();
  await expect(es).toBeDisabled();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
