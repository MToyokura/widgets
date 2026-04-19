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
    code: "zh-cn",
    label: "中文",
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
  "zh-cn": {
    message: "本网站也提供{language}版本。",
    linkText: "以{language}打开",
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

  return normalized.split("-")[0] ?? null;
}

export function getPathLocale(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return normalizeLocale(firstSegment);
}

export function buildLocalePath(pathname: string, locale: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}/`;
  }

  const [, ...rest] = segments;
  const suffix = rest.length > 0 ? `${rest.join("/")}/` : "";

  return `/${locale}/${suffix}`;
}
