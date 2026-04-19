<svelte:options runes={true} />

<script lang="ts">
  let {
    id,
    locale = "en",
    kind = "pixelRatioCap",
    checked = true,
    label,
    description,
  }: {
    id: string;
    locale?: string;
    kind?: "pixelRatioCap" | "antialias";
    checked?: boolean;
    label?: string;
    description?: string;
  } = $props();

  const copy = {
    en: {
      pixelRatioCap: {
        label: "Pixel Ratio Cap",
        description:
          "Enable to cap render resolution for lower GPU load and smoother performance on slower devices. Disable for sharper output.",
      },
      antialias: {
        label: "Antialiasing",
        description: "Smooths jagged edges, but can increase rendering load.",
      },
    },
    ja: {
      pixelRatioCap: {
        label: "ピクセル比の上限",
        description:
          "オンにすると描画解像度の上限を抑え、GPU負荷を下げて動作を安定させます。より鮮明な表示を優先する場合はオフにしてください。",
      },
      antialias: {
        label: "アンチエイリアス",
        description:
          "輪郭のギザギザを滑らかにしますが、描画負荷が増えることがあります。",
      },
    },
    hi: {
      pixelRatioCap: {
        label: "पिक्सेल अनुपात सीमा",
        description:
          "निम्न GPU लोड और धीमे उपकरणों पर बेहतर प्रदर्शन के लिए रेंडर रिज़ॉल्यूशन सीमित करें। अधिक स्पष्ट आउटपुट के लिए इसे बंद करें।",
      },
      antialias: {
        label: "एंटी-अलियासिंग",
        description:
          "किनारों की खुरदराहट को चिकना करती है, लेकिन रेंडरिंग लोड बढ़ा सकती है।",
      },
    },
    pt: {
      pixelRatioCap: {
        label: "Limite da proporção de pixels",
        description:
          "Ative para limitar a resolução de renderização, reduzindo a carga da GPU e melhorando o desempenho em dispositivos mais lentos. Desative para obter uma saída mais nítida.",
      },
      antialias: {
        label: "Suavização de serrilhado",
        description:
          "Suaviza bordas serrilhadas, mas pode aumentar a carga de renderização.",
      },
    },
    bn: {
      pixelRatioCap: {
        label: "পিক্সেল অনুপাত সীমা",
        description:
          "ধীর ডিভাইসে GPU লোড কমিয়ে মসৃণ কর্মক্ষমতার জন্য রেন্ডার রেজোলিউশন সীমিত করুন। আরও তীক্ষ্ণ আউটপুটের জন্য এটি বন্ধ করুন।",
      },
      antialias: {
        label: "অ্যান্টি-অ্যালিয়াসিং",
        description:
          "খাঁজকাটা প্রান্ত মসৃণ করে, তবে রেন্ডারিং লোড বাড়তে পারে।",
      },
    },
    es: {
      pixelRatioCap: {
        label: "Límite de proporción de píxeles",
        description:
          "Actívalo para limitar la resolución de renderizado, reducir la carga de la GPU y mejorar el rendimiento en dispositivos más lentos. Desactívalo para obtener una imagen más nítida.",
      },
      antialias: {
        label: "Suavizado de bordes",
        description:
          "Suaviza los bordes dentados, pero puede aumentar la carga de renderizado.",
      },
    },
    ru: {
      pixelRatioCap: {
        label: "Ограничение соотношения пикселей",
        description:
          "Включите, чтобы ограничить разрешение рендеринга, снизить нагрузку на GPU и улучшить производительность на более медленных устройствах. Отключите для более чёткого изображения.",
      },
      antialias: {
        label: "Сглаживание",
        description:
          "Сглаживает зубчатые края, но может увеличить нагрузку рендеринга.",
      },
    },
  } as const;

  const language = $derived(
    locale in copy ? (locale as keyof typeof copy) : "en",
  );
  const toggleKind = $derived(
    kind === "antialias" ? "antialias" : "pixelRatioCap",
  );
  const text = $derived(copy[language][toggleKind]);
</script>

<label class="scene-render-toggle" for={id}>
  <div class="scene-render-toggle__header">
    <input {id} class="scene-render-toggle__input" type="checkbox" {checked} />
    <span class="scene-render-toggle__title">{label ?? text.label}</span>
  </div>
  <p class="scene-render-toggle__description">
    {description ?? text.description}
  </p>
</label>

<style>
  .scene-render-toggle {
    display: block;
    padding: 0.875rem 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.75rem;
    cursor: pointer;
  }

  .scene-render-toggle__header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .scene-render-toggle__title {
    color: var(--sl-color-text);
    font-weight: 600;
  }

  .scene-render-toggle__input {
    inline-size: 1rem;
    block-size: 1rem;
  }

  .scene-render-toggle__description {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    color: var(--sl-color-text);
  }
</style>
