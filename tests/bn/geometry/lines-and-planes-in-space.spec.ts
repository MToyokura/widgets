import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/bn/geometry/lines-and-planes-in-space/";

test.describe("স্থানিক রেখা ও সমতল (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should show examples of plane determination", async ({ page }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });
});
