import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/ru/";

test.describe("Root index (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should show the get started button in Russian", async ({ page }) => {
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
