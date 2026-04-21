import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/hi/geometry/properties-of-lines-and-planes-in-space/";

test.describe("अंतरिक्ष में रेखाओं और समतलों के गुणधर्म (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Three.js दृश्य दिखते हैं", async ({ page }) => {
    const wrappers = [
      "#perpendicular-line-and-plane-wrapper",
      "#two-lines-parallel-to-same-line-wrapper",
      "#two-lines-perpendicular-to-same-line-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
