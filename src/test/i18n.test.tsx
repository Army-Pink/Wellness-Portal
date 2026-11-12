import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import en from "@/content/i18n/en.json";
import es from "@/content/i18n/es.json";
import { isLang, translate, type MessageKey } from "@/lib/i18n";
import { PrefsProvider, usePrefs } from "@/lib/prefs";

describe("typed catalogs", () => {
  it("loads en.json and es.json with stable dotted keys", () => {
    expect(Object.keys(en).length).toBeGreaterThan(0);
    for (const k of [...Object.keys(en), ...Object.keys(es)]) {
      expect(k).toMatch(/^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)+$/);
    }
  });

  it("es.json has no keys that en.json lacks", () => {
    const known = new Set(Object.keys(en));
    expect(Object.keys(es).filter((k) => !known.has(k))).toEqual([]);
  });

  it("rejects unknown keys at compile time", () => {
    // @ts-expect-error "nav.doesNotExist" is not a key in en.json
    const bad = translate("en", "nav.doesNotExist");
    expect(bad).toBeUndefined();
  });
});

describe("translate", () => {
  it("returns English for en and Spanish for es", () => {
    expect(translate("en", "nav.quickExit")).toBe("Quick Exit");
    expect(translate("es", "nav.quickExit")).toBe("Salida rápida");
  });

  it("falls back to English when the English entry is the only text", () => {
    const key = "notice.translationPending" satisfies MessageKey;
    expect(translate("en", key)).toBe("");
    expect(translate("es", key)).not.toBe("");
  });

  it("falls back to English when Spanish has no entry", () => {
    const real = es as Record<string, string>;
    const saved = real["nav.home"];
    delete real["nav.home"];
    try {
      expect(translate("es", "nav.home")).toBe("Home");
    } finally {
      real["nav.home"] = saved!;
    }
  });

  it("falls back to English when the Spanish entry is empty", () => {
    const real = es as Record<string, string>;
    const saved = real["nav.home"];
    real["nav.home"] = "";
    try {
      expect(translate("es", "nav.home")).toBe("Home");
    } finally {
      real["nav.home"] = saved!;
    }
  });

  it("validates stored language values", () => {
    expect(isLang("es")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

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
