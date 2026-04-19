import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/bn/geometry/properties-of-parallel-lines-and-angles/";

test.describe("সমান্তরাল রেখা ও কোণের বৈশিষ্ট্য (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/সমান্তরাল রেখা ও কোণের বৈশিষ্ট্য/);
    await expect(
      page.getByRole("heading", {
        name: "সমান্তরাল রেখা ও কোণের বৈশিষ্ট্য",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("should have corresponding angles widget", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });
});
