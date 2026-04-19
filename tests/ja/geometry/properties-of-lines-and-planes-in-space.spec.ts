import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/properties-of-lines-and-planes-in-space/";

test.describe("空間における直線と平面の性質 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/空間における直線と平面の性質/);
    await expect(
      page.getByRole("heading", { name: "空間における直線と平面の性質", level: 1 }),
    ).toBeVisible();
  });

  test("Three.jsのビジュアライゼーションが表示されること", async ({ page }) => {
    const wrappers = [
      "#perpendicular-line-and-plane-wrapper",
      "#two-lines-parallel-to-same-line-wrapper",
      "#two-lines-perpendicular-to-same-line-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
