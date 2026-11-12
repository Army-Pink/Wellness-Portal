import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { faqs } from "@/lib/faq";

const HOTLINE = "1-800-799-7233";

// Questions in the founder's brief order (docs/decisions/founder-brief-2026-10-26.md).
const briefQuestions = [
  "Do I need an account to use the Portal?",
  "Is anything I do here saved?",
  "What does Quick Exit do?",
  "What if I need help right now?",
  "Is my artwork private?",
  "Can I save or download my artwork?",
  "Can anyone see what I do in the Portal?",
  "Does the Portal provide crisis support or professional services?",
  "Where can I learn more about Army Pink?",
];

describe("Home FAQ (AP-19)", () => {
  it("has the founder's 9 questions in order", () => {
    expect(faqs.map((f) => f.q)).toEqual(briefQuestions);
  });
  it("shows the hotline once per answer, only in #4 and #8", () => {
    faqs.forEach((f, i) => {
      const count = f.a.split(HOTLINE).length - 1;
      expect(count, `FAQ ${i + 1}`).toBe(i === 3 || i === 7 ? 1 : 0);
      expect(f.a.split("911").length - 1, `FAQ ${i + 1} 911`).toBeLessThanOrEqual(1);
    });
  });
  it("uses the interim artwork answer (#5) until gallery sharing exists", () => {
    expect(faqs[4]?.a).toContain("isn't available yet");
  });
  it("is not translated: answers have no Spanish entry", () => {
    const es = readFileSync("src/lib/es.ts", "utf8");
    for (const f of faqs) expect(es).not.toContain(f.a);
  });
});
