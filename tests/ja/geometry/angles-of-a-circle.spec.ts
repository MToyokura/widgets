import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/ja/geometry/angles-of-a-circle/";

test.describe("円周角と中心角 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/円周角と中心角/);
    await expect(
      page.getByRole("heading", { name: "円周角と中心角", level: 1 }),
    ).toBeVisible();
  });

  test("円周角のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("中心角のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Central angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("タレスの定理のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Thales diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("円周角の定理の証明のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle proof diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });
});
