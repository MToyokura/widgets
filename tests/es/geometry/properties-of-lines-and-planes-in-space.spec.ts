import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/es/geometry/properties-of-lines-and-planes-in-space/";

test.describe("Propiedades de líneas y planos en el espacio (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page).toHaveTitle(
      /Propiedades de líneas y planos en el espacio/,
    );
    await expect(
      page.getByRole("heading", {
        name: "Propiedades de líneas y planos en el espacio",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("debe tener visualizaciones Three.js", async ({ page }) => {
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
