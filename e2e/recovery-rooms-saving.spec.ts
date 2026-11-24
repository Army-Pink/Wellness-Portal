import { choose, expect, test } from "./fixtures";

/** AP-14a: Recovery Rooms save through the repository with the correct kind. */
const rooms = [
  { slug: "crisis", name: "Crisis" },
  { slug: "healing", name: "Healing" },
];

for (const room of rooms) {
  test(`${room.name} Room saves a completed exercise as kind "exercise"`, async ({ page }) => {
    await choose(page, "Save on This Device");
    await page.goto(`/recovery-rooms/${room.slug}`);
    await page.getByRole("button", { name: "Start exercise" }).click();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("You completed this exercise.")).toBeVisible();

    await page.getByRole("button", { name: "Save to my device" }).click();
    await expect(page.getByText("Saved to My Saved Items on this device.")).toBeVisible();

    // Read the stored record directly: the saved item is in the repository's store.
    const items = await page.evaluate(
      () =>
        new Promise<{ kind: string; roomId: string; source: string }[]>((resolve, reject) => {
          const open = indexedDB.open("wellness-portal-saved-items");
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const all = open.result.transaction("items").objectStore("items").getAll();
            all.onerror = () => reject(all.error);
            all.onsuccess = () => resolve(all.result);
          };
        }),
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "exercise",
      roomId: `recovery-${room.slug}`,
      source: `/recovery-rooms/${room.slug}`,
    });

    // It survives a reload and appears in My Saved Items.
    await page.goto("/saved-items");
    await page.reload();
    await expect(page.getByRole("button", { name: /^Open item: / })).toHaveCount(1);
  });
}
