import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/angle-bisector-theorem/";

test.describe("角の二等分線の定理 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/角の二等分線の定理/);
    await expect(
      page.getByRole("heading", { name: "角の二等分線の定理", level: 1 }),
    ).toBeVisible();
  });

  test("インタラクティブなウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='角の二等分線定理の証明図']",
    );
    await expect(svg).toBeVisible();
  });

  test("ドラッグ可能な点があること", async ({ page }) => {
    const points = page.locator("circle.cursor-grab");
    await expect(points).toHaveCount(3);
  });

  test("ステップを制御するスライダーがあること", async ({ page }) => {
    const slider = page.getByRole("slider", { name: /ステップ/ });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("0");

    // ステップ1に移動 (ラベルは steps + 1 を表示するので "ステップ 2" になる)
    await slider.fill("1");
    await expect(slider).toHaveValue("1");
    await expect(page.getByText("ステップ 2")).toBeVisible();

    // ステップ4に移動 (ラベルは "ステップ 5" になる)
    await slider.fill("4");
    await expect(slider).toHaveValue("4");
    await expect(page.getByText("ステップ 5")).toBeVisible();
  });

  test("点をドラッグできること", async ({ page }) => {
    const pointA = page.locator("circle.cursor-grab").first();
    const box = await pointA.boundingBox();
    if (!box) throw new Error("点Aのバウンディングボックスが見つかりません");

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await pointA.hover();
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 50, { steps: 10 });
    await page.mouse.up();

    const newBox = await pointA.boundingBox();
    if (!newBox)
      throw new Error(
        "ドラッグ後の点Aのバウンディングボックスが見つかりません",
      );

    expect(newBox.x).not.toBe(box.x);
    expect(newBox.y).not.toBe(box.y);
  });
});
