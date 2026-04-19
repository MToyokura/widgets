import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/angle-bisector-theorem/";

test.describe("角平分线定理 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/角平分线定理/);
    await expect(
      page.getByRole("heading", { name: "角平分线定理", level: 1 }),
    ).toBeVisible();
  });

  test("交互式小部件显示", async ({ page }) => {
    // aria-label is hardcoded in English in the component
    const svg = page.locator(
      "svg[aria-label='Angle bisector theorem proof diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("可拖动的点存在", async ({ page }) => {
    const points = page.locator("circle.cursor-grab");
    await expect(points).toHaveCount(3);
  });

  test("有控制步骤的滑块", async ({ page }) => {
    // The label is currently hardcoded as "Step" in the component
    const slider = page.getByRole("slider", { name: /Step/ });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("0");

    // move to step 1
    await slider.fill("1");
    await expect(slider).toHaveValue("1");
    await expect(page.getByText("Step 1")).toBeVisible();

    // move to step 4
    await slider.fill("4");
    await expect(slider).toHaveValue("4");
    await expect(page.getByText("Step 4")).toBeVisible();
  });

  test("可以拖动点", async ({ page }) => {
    const pointA = page.locator("circle.cursor-grab").first();
    const box = await pointA.boundingBox();
    if (!box) throw new Error("未找到点A的边界框");

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await pointA.hover();
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 50, { steps: 10 });
    await page.mouse.up();

    const newBox = await pointA.boundingBox();
    if (!newBox) throw new Error("拖动后未找到点A的边界框");

    expect(newBox.x).not.toBe(box.x);
    expect(newBox.y).not.toBe(box.y);
  });
});
