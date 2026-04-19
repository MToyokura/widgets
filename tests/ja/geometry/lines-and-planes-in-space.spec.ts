import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/lines-and-planes-in-space/";

test.describe("空間における直線と平面 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/空間における直線と平面/);
    await expect(
      page.getByRole("heading", { name: "空間における直線と平面", level: 1 }),
    ).toBeVisible();
  });

  test("Three.jsのビジュアライゼーションが表示されること", async ({ page }) => {
    const wrappers = [
      "#three-points-not-collinear-wrapper",
      "#line-and-point-not-on-line-wrapper",
      "#intersecting-lines-wrapper",
      "#intersecting-lines-above-wrapper",
      "#parallel-lines-wrapper",
      "#skew-position-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
