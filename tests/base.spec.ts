import { expect, test, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

type PageCase = {
  path: string;
  title: string;
  verify: (page: Page) => Promise<void>;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titlePattern(title: string) {
  return new RegExp(`${escapeRegExp(title)}(?: \\| Widgets)?$`);
}

const pages: PageCase[] = [
  {
    path: "/",
    title: "Widgets",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Interactive widgets for visual learning",
          level: 1,
        }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "English" })).toBeVisible();
      await expect(page.getByRole("link", { name: "日本語" })).toBeVisible();
    },
  },
  {
    path: "/en/",
    title: "Widgets",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Widgets", level: 1 }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Get started" }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/angle-bisector-theorem/",
    title: "Angle Bisector Theorem",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Angle Bisector Theorem", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/angles-of-a-circle/",
    title: "Angles of a Circle",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Angles of a Circle", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/",
    title:
      "Construction of Spatial Figures through the Motion of Plane Figures",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Construction of Spatial Figures through the Motion of Plane Figures",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/lines-and-planes-in-space/",
    title: "Lines and Planes in Space",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Lines and Planes in Space",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/pictorial-drawing/",
    title: "Pictorial Drawing",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Pictorial Drawing", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/properties-of-lines-and-planes-in-space/",
    title: "Properties of Lines and Planes in Space",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Properties of Lines and Planes in Space",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/properties-of-parallel-lines-and-angles/",
    title: "Parallel Lines and Angle Properties",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Parallel Lines and Angle Properties",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/en/geometry/transformation-of-figures-in-a-plane/",
    title: "Transformation of Figures in a Plane",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "Transformation of Figures in a Plane",
          level: 1,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Translation", level: 2 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/",
    title: "Widgets",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Widgets", level: 1 }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "始める" })).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/angle-bisector-theorem/",
    title: "角の二等分線の定理",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "角の二等分線の定理", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/angles-of-a-circle/",
    title: "円周角と中心角",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "円周角と中心角", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/",
    title: "平面図形の運動による空間図形の構成",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "平面図形の運動による空間図形の構成",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/lines-and-planes-in-space/",
    title: "空間における直線と平面",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "空間における直線と平面", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/pictorial-drawing/",
    title: "見取図",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "見取図", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/properties-of-lines-and-planes-in-space/",
    title: "空間における直線と平面の性質",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: "空間における直線と平面の性質",
          level: 1,
        }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/properties-of-parallel-lines-and-angles/",
    title: "線と角の性質",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "線と角の性質", level: 1 }),
      ).toBeVisible();
    },
  },
  {
    path: "/ja/geometry/transformation-of-figures-in-a-plane/",
    title: "平面における図形の移動",
    verify: async (page) => {
      await expect(
        page.getByRole("heading", { name: "平面における図形の移動", level: 1 }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "平行移動", level: 2 }),
      ).toBeVisible();
    },
  },
];

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

  for (const { path, title, verify } of pages) {
    test(`opens ${path} (${title})`, async ({ page }) => {
      await page.goto(new URL(path, BASE).toString());
      await expect(page).toHaveTitle(titlePattern(title));
      await verify(page);
    });
  }
});
