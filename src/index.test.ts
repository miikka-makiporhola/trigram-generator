import { describe, expect, it } from "vitest";
import { TrigramGenerator } from "./index.js";

describe("TrigramGenerator", () => {
  describe("With small input", () => {
    it("generates expected trigram output", () => {
      const generator = new TrigramGenerator({ seed: 2 });
      generator.addSource("I wish I may I wish I might");
      generator.finalize();
      const result = generator.generate({ maxTokens: 100 });
      expect(result).toBe("I may I wish I may I wish I might");
    });
  });
});
