// import en from "@/content/i18n/en.json";
// import es from "@/content/i18n/es.json";

// export type Lang = "en" | "es";

// /** Every key in en.json. A key that is not in en.json fails the typecheck. */
// export type MessageKey = keyof typeof en;

// type Catalog = Partial<Record<MessageKey, string>>;

// // es.json may omit keys (not yet translated); it may not contain keys that en.json lacks.
// const catalogs: Record<Lang, Catalog> = { en, es: es satisfies Catalog };

// export const LANGS: readonly Lang[] = ["en", "es"];

// export function isLang(v: unknown): v is Lang {
//   return v === "en" || v === "es";
// }

// /**
//  * Look up a message. Spanish falls back to English when the key has no Spanish entry
//  * (or an empty one), so a missing translation never shows a blank or a raw key.
//  */
// export function translate(lang: Lang, key: MessageKey): string {
//   const own = catalogs[lang][key];
//   return own !== undefined && own !== "" ? own : en[key];
// }

// export type TFunction = (key: MessageKey) => string;

import en from "@/content/i18n/en.json";
import es from "@/content/i18n/es.json";

export type Lang = "en" | "es";

// --- Type helpers -----------------------------------------------------------

type Primitive = string | number | boolean | null | undefined;

/**
 * All dot-separated paths through an object, as string literal types.
 * { a: { b: "x" } } => "a.b"
 * Arrays are treated as leaves (we don't i18n into arrays).
 */
type Paths<T> = T extends Primitive
  ? never
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: T[K] extends Primitive
          ? K
          : T[K] extends readonly unknown[]
            ? K // array leaves are addressable as a whole
            : `${K}.${Paths<T[K]>}`;
      }[keyof T & string];

/** The value type at a given dotted path. Used to constrain results to strings. */
type ValueAt<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? ValueAt<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** Only keep paths whose leaf value is a string. */
type StringPaths<T> = {
  [P in Paths<T>]: ValueAt<T, P> extends string ? P : never;
}[Paths<T>];

type DeepPartial<T> = T extends string
  ? string | undefined
  : T extends readonly unknown[]
    ? T // arrays must be complete if present
    : { [K in keyof T]?: DeepPartial<T[K]> };

type Catalog = DeepPartial<typeof en>;

// Every string-leaf path in en.json. Anything not in en.json fails the typecheck.
export type MessageKey = StringPaths<typeof en>;

// es.json may omit keys (not yet translated); it may not contain keys en.json lacks,
// and leaf types must match.
const catalogs = { en, es: es satisfies DeepPartial<typeof en> as typeof en };

export const LANGS: readonly Lang[] = ["en", "es"];

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "es";
}

/**
 * Look up a message. Spanish falls back to English when the path has no Spanish
 * entry (or an empty one), so a missing translation never shows a blank or a raw key.
 */
function get(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function translate(lang: Lang, key: MessageKey): string {
  const own = get(catalogs[lang], key);
  if (typeof own === "string" && own !== "") return own;

  const fallback = get(en, key);
  // `MessageKey` guarantees this is a string at the type level; the guard keeps
  // runtime honest if JSON was hand-edited and something slipped through.
  return typeof fallback === "string" ? fallback : key;
}

export type TFunction = (key: MessageKey) => string;
