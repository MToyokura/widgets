import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/angle-bisector-theorem/";

test.describe("कोण समद्विभाजक प्रमेय (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page).toHaveTitle(/कोण समद्विभाजक प्रमेय/);
    await expect(
      page.getByRole("heading", { name: "कोण समद्विभाजक प्रमेय", level: 1 }),
    ).toBeVisible();
  });

  test("इंटरैक्टिव विजेट दिखता है", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='कोण समद्विभाजक प्रमेय के प्रमाण का आरेख']",
    );
    await expect(svg).toBeVisible();
  });

  test("इंटरैक्टिव बिंदु दिखते हैं", async ({ page }) => {
    const points = page.locator("circle.cursor-grab");
    await expect(points).toHaveCount(3);
  });

  test("चरण नियंत्रित करने के लिए स्लाइडर दिखता है", async ({ page }) => {
    const slider = page.getByRole("slider", { name: /चरण/ });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("0");

    await slider.fill("1");
    await expect(slider).toHaveValue("1");
    await expect(page.getByText("चरण 1")).toBeVisible();

    await slider.fill("4");
    await expect(slider).toHaveValue("4");
    await expect(page.getByText("चरण 4")).toBeVisible();
  });

  test("बिंदुओं को खींचा जा सकता है", async ({ page }) => {
    const pointA = page.locator("circle.cursor-grab").first();
    const box = await pointA.boundingBox();
    if (!box) throw new Error("Could not find point A bounding box");

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await pointA.hover();
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 50, { steps: 10 });
    await page.mouse.up();

    const newBox = await pointA.boundingBox();
    if (!newBox)
      throw new Error("Could not find point A bounding box after drag");

    expect(newBox.x).not.toBe(box.x);
    expect(newBox.y).not.toBe(box.y);
  });
});
