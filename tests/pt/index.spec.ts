import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/";

test.describe("Root index (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should show the get started button in Portuguese", async ({ page }) => {
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
