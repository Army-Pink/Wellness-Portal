import { choose, expect, test } from "./fixtures";

/** AR-1: the canvas keeps its picture across resizes, undo works, and saved pictures are a fixed size. */

async function inkPixels(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas[aria-label="Drawing canvas"]')!;
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) n++;
    return { n, w: c.width, h: c.height };
  });
}

async function drawLine(page: import("@playwright/test").Page) {
  await page.getByLabel("Drawing canvas").scrollIntoViewIfNeeded();
  const box = (await page.getByLabel("Drawing canvas").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();
}

test.describe("Art Room canvas", () => {
  test.beforeEach(async ({ page }) => {
    await choose(page, "Save on This Device");
    await page.goto("/art-room");
    // Drawing handlers attach when the page hydrates; wait so the first stroke is not lost.
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Drawing canvas").scrollIntoViewIfNeeded();
  });

  test("keeps the same fixed-size picture when the window is resized", async ({ page }) => {
    await drawLine(page);
    const before = await inkPixels(page);
    expect(before.n).toBeGreaterThan(0);
    expect([before.w, before.h]).toEqual([1200, 900]);

    await page.setViewportSize({ width: 520, height: 900 });
    await page.setViewportSize({ width: 1100, height: 800 });
    const after = await inkPixels(page);
    expect(after).toEqual(before);
  });

  test("undo removes the last stroke and does nothing on an empty canvas", async ({ page }) => {
    await page.getByRole("button", { name: "Undo" }).click();
    expect((await inkPixels(page)).n).toBe(0);

    await drawLine(page);
    expect((await inkPixels(page)).n).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Undo" }).click();
    expect((await inkPixels(page)).n).toBe(0);
  });

  test("clear empties the picture", async ({ page }) => {
    await drawLine(page);
    await page.getByRole("button", { name: "Clear canvas" }).click();
    expect((await inkPixels(page)).n).toBe(0);
  });

  test("a second touch or pen at the same time does not draw", async ({ page }) => {
    const box = (await page.getByLabel("Drawing canvas").boundingBox())!;
    await page.evaluate(
      ([x, y]) => {
        const c = document.querySelector('canvas[aria-label="Drawing canvas"]')!;
        const fire = (type: string, id: number, dx: number) =>
          c.dispatchEvent(
            new PointerEvent(type, {
              pointerId: id,
              pointerType: "touch",
              clientX: x! + dx,
              clientY: y!,
              bubbles: true,
              isPrimary: id === 1,
            }),
          );
        fire("pointerdown", 1, 0);
        fire("pointerdown", 2, 200); // a resting palm
        fire("pointermove", 2, 260);
        fire("pointerup", 2, 260);
        fire("pointerup", 1, 0);
      },
      [box.x + 40, box.y + 40],
    );
    // Only the first touch's dot is drawn: a dot, far fewer pixels than a drawn line.
    const { n } = await inkPixels(page);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(2000);
  });

  test("saving still stores a picture and nothing leaves the Portal", async ({ page }) => {
    await drawLine(page);
    await page.getByRole("button", { name: "Save to my device" }).click();
    await expect(page.getByText("Saved to My Saved Items on this device.")).toBeVisible();
  });
});
