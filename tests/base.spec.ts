import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("Widgets site — smoke tests", () => {
  test("home page has correct title and hero", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveTitle("Widgets");
    await expect(
      page.getByRole("heading", {
        name: "Interactive widgets for visual learning",
      }),
    ).toBeVisible();
  });

  test("language selector shows English and 日本語", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.getByText("Choose a language")).toBeVisible();
    await expect(page.getByRole("link", { name: "English" })).toBeVisible();
    await expect(page.getByRole("link", { name: "日本語" })).toBeVisible();
  });

  test("navigates to English transformation page", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(
      /\/en\/geometry\/transformation-of-figures-in-a-plane/,
    );
    await expect(
      page.getByRole("heading", { name: "Translation" }),
    ).toBeVisible();
  });
});
