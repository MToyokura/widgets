import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/es/";

test.describe("Root index (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should show the get started button in Spanish", async ({ page }) => {
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
