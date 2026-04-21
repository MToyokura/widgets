import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/bn/geometry/properties-of-parallel-lines-and-angles/";

test.describe("সমান্তরাল রেখা ও কোণের বৈশিষ্ট্য (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have corresponding angles widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").first();
    await expect(svg).toBeVisible();
  });
});
