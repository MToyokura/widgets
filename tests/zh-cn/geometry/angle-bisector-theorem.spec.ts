import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/zh-cn/geometry/angle-bisector-theorem/";

test.describe("角平分线定理 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("交互式小部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").first();
    await expect(svg).toBeVisible();
  });

  test("可拖动的点存在", async ({ page }) => {
    const points = page.locator("circle.cursor-grab");
    await expect(points).toHaveCount(3);
  });

  test("有控制步骤的滑块", async ({ page }) => {
    const slider = page.getByRole("slider").first();
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("0");

    await slider.evaluate((el: HTMLInputElement) => {
      el.value = "1";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(slider).toHaveValue("1");

    await slider.evaluate((el: HTMLInputElement) => {
      el.value = "4";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(slider).toHaveValue("4");
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
