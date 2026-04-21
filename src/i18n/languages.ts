export type SupportedLocale = {
  code: string;
  label: string;
};

type LanguagePromptTemplate = {
  message: string;
  linkText: string;
};

export const supportedLocales: SupportedLocale[] = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "ja",
    label: "日本語",
  },
  {
    code: "pt",
    label: "Português",
  },
  {
    code: "zh-cn",
    label: "中文",
  },
  {
    code: "es",
    label: "Español",
  },
  {
    code: "hi",
    label: "हिन्दी",
  },
  {
    code: "ru",
    label: "Русский",
  },
  {
    code: "bn",
    label: "বাংলা",
  },
];

export const languagePromptTemplates: Record<string, LanguagePromptTemplate> = {
  en: {
    message: "This website is also available in {language}.",
    linkText: "Open in {language}",
  },
  ja: {
    message: "このサイトは{language}版があります。",
    linkText: "{language}で開く",
  },
  pt: {
    message: "Este site também está disponível em {language}.",
    linkText: "Abrir em {language}",
  },
  "zh-cn": {
    message: "本网站也提供{language}版本。",
    linkText: "以{language}打开",
  },
  es: {
    message: "Este sitio también está disponible en {language}.",
    linkText: "Abrir en {language}",
  },
  hi: {
    message: "यह वेबसाइट {language} में भी उपलब्ध है।",
    linkText: "{language} में खोलें",
  },
  ru: {
    message: "Этот сайт также доступен на {language}.",
    linkText: "Открыть на {language}",
  },
  bn: {
    message: "এই ওয়েবসাইটটি {language} ভাষায়ও উপলব্ধ।",
    linkText: "{language} এ খুলুন",
  },
};

export function normalizeLocale(locale?: string | null) {
  if (!locale) {
    return null;
  }

  const normalized = locale.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const exactMatch = supportedLocales.find(({ code }) => code === normalized);

  if (exactMatch) {
    return exactMatch.code;
  }

  return normalized.split("-")[0] ?? null;
}

export function getPathLocale(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return normalizeLocale(firstSegment);
}
