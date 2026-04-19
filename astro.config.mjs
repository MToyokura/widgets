// @ts-check
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    starlight({
      title: "Widgets",
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
          lang: "en",
        },
        ja: {
          label: "日本語",
          lang: "ja",
        },
        "zh-cn": {
          label: "中文",
          lang: "zh-cn",
        },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Geometry",
          translations: {
            ja: "図形",
            "zh-cn": "几何",
          },
          autogenerate: {
            directory: "geometry",
          },
        },
      ],
    }),
  ],
});
