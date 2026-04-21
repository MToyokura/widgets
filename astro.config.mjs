// @ts-check
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://mtoyokura.github.io",
  base: "/widgets",
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
        pt: {
          label: "Português",
          lang: "pt",
        },
        "zh-cn": {
          label: "中文",
          lang: "zh-cn",
        },
        es: {
          label: "Español",
          lang: "es",
        },
        hi: {
          label: "हिन्दी",
          lang: "hi",
        },
        ru: {
          label: "Русский",
          lang: "ru",
        },
        bn: {
          label: "বাংলা",
          lang: "bn",
        },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/MToyokura/widgets",
        },
      ],
      sidebar: [
        {
          label: "Geometry",
          translations: {
            ja: "図形",
            pt: "Geometria",
            "zh-cn": "几何",
            es: "Geometría",
            hi: "ज्यामिति",
            ru: "Геометрия",
            bn: "জ্যামিতি",
          },
          autogenerate: {
            directory: "geometry",
          },
        },
      ],
    }),
  ],
});
