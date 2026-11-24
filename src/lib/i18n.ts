import en from "@/content/i18n/en.json";
import es from "@/content/i18n/es.json";
import esMeta from "@/content/i18n/es.meta.json";

export type Lang = "en" | "es";

/** Every key in en.json. A key that is not in en.json fails the typecheck. */
export type MessageKey = keyof typeof en;

export const reviewStatuses = ["draft", "reviewed", "approved"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export const sensitivities = ["general", "sensitive"] as const;
export type Sensitivity = (typeof sensitivities)[number];

export type MessageMeta = {
  status: ReviewStatus;
  sensitivity: Sensitivity;
};

type Catalog = Partial<Record<MessageKey, string>>;

// es.json may omit keys (not yet translated); it may not contain keys that en.json lacks.
const catalogs: Record<Lang, Catalog> = { en, es: es satisfies Catalog };

// Review status for every English key. Missing keys fail the unit tests.
const meta = esMeta as Record<MessageKey, MessageMeta>;

export const LANGS: readonly Lang[] = ["en", "es"];

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "es";
}

export function messageMeta(key: MessageKey): MessageMeta {
  return meta[key];
}

/**
 * Spanish is shown only when the entry is allowed for visitors:
 * - general strings: any draft/reviewed/approved Spanish
 * - sensitive strings: approved Spanish only
 * Everything else falls back to English (TR-03).
 */
export function canShowSpanish(key: MessageKey): boolean {
  const own = catalogs.es[key];
  if (own === undefined || own === "") return false;
  const { status, sensitivity } = meta[key];
  if (sensitivity === "sensitive") return status === "approved";
  return true;
}

/**
 * Look up a message. Spanish falls back to English when the key has no Spanish
 * entry, or when a sensitive string is not yet approved (TR-03).
 */
export function translate(lang: Lang, key: MessageKey): string {
  if (lang === "es" && canShowSpanish(key)) return catalogs.es[key]!;
  return en[key];
}

export type TFunction = (key: MessageKey) => string;
