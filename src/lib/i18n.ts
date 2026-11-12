import en from "@/content/i18n/en.json";
import es from "@/content/i18n/es.json";

export type Lang = "en" | "es";

/** Every key in en.json. A key that is not in en.json fails the typecheck. */
export type MessageKey = keyof typeof en;

type Catalog = Partial<Record<MessageKey, string>>;

// es.json may omit keys (not yet translated); it may not contain keys that en.json lacks.
const catalogs: Record<Lang, Catalog> = { en, es: es satisfies Catalog };

export const LANGS: readonly Lang[] = ["en", "es"];

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "es";
}

/**
 * Look up a message. Spanish falls back to English when the key has no Spanish entry
 * (or an empty one), so a missing translation never shows a blank or a raw key.
 */
export function translate(lang: Lang, key: MessageKey): string {
  const own = catalogs[lang][key];
  return own !== undefined && own !== "" ? own : en[key];
}

export type TFunction = (key: MessageKey) => string;
