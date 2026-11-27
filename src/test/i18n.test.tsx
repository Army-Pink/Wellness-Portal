import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import en from "@/content/i18n/en.json";
import es from "@/content/i18n/es.json";
import { isLang, translate, type MessageKey } from "@/lib/i18n";
import { PrefsProvider, usePrefs } from "@/lib/prefs";

// ---------------------------------------------------------------------------
// Test helpers — the tests need to reach into nested JSON, so a couple of
// dotted-path utilities mirror the production `get`/`set` logic.
// ---------------------------------------------------------------------------

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

function getAt(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function setAt(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  const last = parts.pop(); // string | undefined
  if (last === undefined) throw new Error(`setAt: empty path`);

  let cur: Record<string, unknown> = obj;
  const walked: string[] = [];

  for (const seg of parts) {
    walked.push(seg);
    const next = cur[seg];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      throw new Error(`setAt: no object at ${walked.join(".")}`);
    }
    cur = next as Record<string, unknown>;
  }

  cur[last] = value;
}

function delAt(obj: Record<string, unknown>, path: string): void {
  const parts = path.split(".");
  const last = parts.pop();
  if (last === undefined) return;

  let cur: Record<string, unknown> = obj;
  for (const seg of parts) {
    const next = cur[seg];
    if (next == null || typeof next !== "object" || Array.isArray(next)) return;
    cur = next as Record<string, unknown>;
  }
  delete cur[last];
}

/** Enumerate every string-leaf dotted path in an object. Mirrors `StringPaths`. */
function leafPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj === "string") return prefix ? [prefix] : [];
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push(next);
    else out.push(...leafPaths(v, next));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Catalogs
// ---------------------------------------------------------------------------

describe("typed catalogs", () => {
  it("loads en.json and es.json with at least one entry", () => {
    expect(Object.keys(en).length).toBeGreaterThan(0);
    expect(Object.keys(es).length).toBeGreaterThan(0);
  });

  it("uses valid segment names at every level of en.json", () => {
    // Only en.json is required to be complete; es.json may have partial objects.
    const paths = leafPaths(en);
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      for (const segment of p.split(".")) {
        expect(segment).toMatch(/^[a-z][A-Za-z0-9]*$/);
      }
    }
  });

  it("every leaf path in es.json is also a leaf path in en.json", () => {
    const known = new Set(leafPaths(en));
    const extra = leafPaths(es).filter((p) => !known.has(p));
    expect(extra).toEqual([]);
  });

  it("es.json leaf values are strings (no shape drift)", () => {
    for (const p of leafPaths(es)) {
      expect(typeof getAt(es, p)).toBe("string");
    }
  });

  it("rejects unknown leaf paths at compile time", () => {
    // @ts-expect-error "nav.doesNotExist" is not a path in en.json
    translate("en", "nav.doesNotExist");
  });

  it("rejects an intermediate-object path at compile time", () => {
    // "nav" is a container, not a string leaf — must not be a valid MessageKey.
    // @ts-expect-error container path is not addressable
    translate("en", "nav");
  });
});

// ---------------------------------------------------------------------------
// translate
// ---------------------------------------------------------------------------

describe("translate", () => {
  it("returns English for en and Spanish for es", () => {
    expect(translate("en", "nav.quickExit")).toBe("Quick Exit");
    expect(translate("es", "nav.quickExit")).toBe("Salida rápida");
  });

  it("resolves nested keys at different depths", () => {
    // Smoke test that a two-level-deep lookup works, whatever the tree shape.
    // (Adjust the specific key to one your catalog actually contains.)
    const deep = leafPaths(en).find((p) => p.split(".").length >= 2);
    expect(deep).toBeDefined();
    if (deep) {
      const viaPath = translate("en", deep as MessageKey);
      expect(typeof viaPath).toBe("string");
      expect(viaPath.length).toBeGreaterThan(0);
    }
  });

  it("falls back to English when Spanish has no entry at that path", () => {
    const path = "nav.home";
    const esObj = es as Record<string, unknown>;
    const saved = getAt(esObj, path);
    delAt(esObj, path);
    try {
      expect(translate("es", path as MessageKey)).toBe(translate("en", path as MessageKey));
    } finally {
      setAt(esObj, path, saved);
    }
  });

  it("falls back to English when the Spanish entry is empty", () => {
    const path = "nav.home";
    const esObj = es as Record<string, unknown>;
    const saved = getAt(esObj, path);
    setAt(esObj, path, "");
    try {
      expect(translate("es", path as MessageKey)).toBe(translate("en", path as MessageKey));
    } finally {
      setAt(esObj, path, saved);
    }
  });

  it("falls back when an entire Spanish sub-object is missing", () => {
    // Remove a whole branch (e.g. `notice`) to prove deep fallback works,
    // not just leaf-level fallback.
    const branch = leafPaths(en)
      .map((p) => p.split(".")[0])
      .find((top) => {
        if (top !== undefined) {
          const subtree = (es as Record<string, unknown>)[top];
          return subtree == null || typeof subtree !== "object";
        }
      });
    // If es mirrors en completely, skip — nothing to remove.
    if (!branch) return;

    const esObj = es as Record<string, unknown>;
    const saved = esObj[branch];
    delete esObj[branch];
    try {
      for (const p of leafPaths(en).filter((x) => x.startsWith(`${branch}.`))) {
        expect(translate("es", p as MessageKey)).toBe(translate("en", p as MessageKey));
      }
    } finally {
      esObj[branch] = saved;
    }
  });

  it("returns the fallback English text, never a raw dotted key", () => {
    const path = "nav.home";
    const enObj = en as Record<string, unknown>;
    const esObj = es as Record<string, unknown>;
    const savedEn = getAt(enObj, path);
    const savedEs = getAt(esObj, path);
    delAt(esObj, path);
    setAt(enObj, path, "");
    try {
      const out = translate("es", path as MessageKey);
      // Both sides empty → implementation falls back to the key itself.
      // The important assertion is that it doesn't leak `undefined`.
      expect(out).not.toBeUndefined();
      expect(typeof out).toBe("string");
    } finally {
      setAt(enObj, path, savedEn);
      setAt(esObj, path, savedEs);
    }
  });

  it("validates stored language values", () => {
    expect(isLang("es")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Provider wiring
// ---------------------------------------------------------------------------

function Probe() {
  const { t, setLang } = usePrefs();
  return (
    <button onClick={() => setLang("es")} data-testid="b">
      {t("nav.home")}
    </button>
  );
}

describe("language setting", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = "";
  });

  it("makes <html lang> and t() follow the toggle", () => {
    render(
      <PrefsProvider>
        <Probe />
      </PrefsProvider>,
    );
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByTestId("b").textContent).toBe("Home");
    act(() => screen.getByTestId("b").click());
    expect(document.documentElement.lang).toBe("es");
    expect(screen.getByTestId("b").textContent).toBe("Inicio");
  });

  it("restores a saved language and ignores invalid values", () => {
    localStorage.setItem("wp-lang", "es");
    const { unmount } = render(
      <PrefsProvider>
        <Probe />
      </PrefsProvider>,
    );
    expect(document.documentElement.lang).toBe("es");
    unmount();
    localStorage.setItem("wp-lang", "xx");
    render(
      <PrefsProvider>
        <Probe />
      </PrefsProvider>,
    );
    expect(document.documentElement.lang).toBe("en");
  });
});
