import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/";

test.describe("Hindi locale root (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should show the Hindi get started button", async ({ page }) => {
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
