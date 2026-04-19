import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH =
  "/bn/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/";

test.describe("সমতল চিত্রের গতি দ্বারা স্থানিক আকার নির্মাণ (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(
      /সমতল চিত্রের গতি দ্বারা স্থানিক আকার নির্মাণ/,
    );
    await expect(
      page.getByRole("heading", {
        name: "সমতল চিত্রের গতি দ্বারা স্থানিক আকার নির্মাণ",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("should show plane creation by translation", async ({ page }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });
});
