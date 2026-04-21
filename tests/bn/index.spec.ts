import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/bn/";

test.describe("Root index (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should show the get started button in Bengali", async ({ page }) => {
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
