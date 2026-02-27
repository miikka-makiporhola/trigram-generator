import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { TrigramGenerator } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("TrigramGenerator", () => {
  let frankensteinText: string;
  let prideAndPrejudiceText: string;
  let kalevalaText: string;

  beforeAll(async () => {
    frankensteinText = await readFile(
      path.join(__dirname, "..", "test", "fixtures", "project_gutenberg_frankenstein.txt"),
      "utf8",
    );
    prideAndPrejudiceText = await readFile(
      path.join(__dirname, "..", "test", "fixtures", "project_gutenberg_pride_and_prejudice.txt"),
      "utf8",
    );
    kalevalaText = await readFile(
      path.join(__dirname, "..", "test", "fixtures", "project_gutenberg_kalevala.txt"),
      "utf8",
    );
  });

  describe("when given small test input", () => {
    it("generates expected output", () => {
      const generator = new TrigramGenerator({ seed: 2 });
      generator.addSource("I wish I may I wish I might");
      generator.finalize();
      const result = generator.generate({ maxTokens: 100 });
      expect(result).toStrictEqual("I may I wish I may I wish I might");
    });

    it("exposes the completed transition list after adding sources", () => {
      const generator = new TrigramGenerator();
      generator.addSource("I wish I may I wish I might");

      expect(generator.getTransitionList()).toStrictEqual([
        { pair: ["I", "wish"], nextTokens: ["I", "I"] },
        { pair: ["wish", "I"], nextTokens: ["may", "might"] },
        { pair: ["I", "may"], nextTokens: ["I"] },
        { pair: ["may", "I"], nextTokens: ["wish"] },
      ]);
    });

    it("keeps the completed transition list available after finalization", () => {
      const generator = new TrigramGenerator();
      generator.addSource("I wish I may I wish I might");
      generator.addSource("I wish I could");
      generator.finalize();

      expect(generator.getTransitionList()).toStrictEqual([
        { pair: ["I", "wish"], nextTokens: ["I", "I", "I"] },
        { pair: ["wish", "I"], nextTokens: ["may", "might", "could"] },
        { pair: ["I", "may"], nextTokens: ["I"] },
        { pair: ["may", "I"], nextTokens: ["wish"] },
      ]);
    });
  });

  describe('when given "Frankenstein" text', () => {
    it("generates expected output", () => {
      const generator = new TrigramGenerator({ seed: 987 });
      generator.addSource(frankensteinText);
      generator.finalize();
      const result = generator.generate({ maxTokens: 50 });
      expect(result).toStrictEqual(
        "They fly quickly over the snow in their sledges; the motion is pleasant, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking. I arrived here yesterday, and as I walk in the streets",
      );
    });
  });

  describe('when given "Kalevala" text', () => {
    it("generates expected output", () => {
      const generator = new TrigramGenerator({ seed: 212 });
      generator.addSource(kalevalaText);
      generator.finalize();
      const result = generator.generate({ maxTokens: 50 });
      expect(result).toStrictEqual(
        "Muurikin jälessä, Kimmon kirjavan keralla. Vilu mulle virttä virkkoi, sae saatteli runoja. Virttä toista tuulet toivat, meren aaltoset ajoivat. Linnut liitteli sanoja, virsiä virittämiä vyöltä vanhan Väinämöisen, alta ahjon Ilmarisen, päästä kalvan Kaukomielen, Joukahaisen jousen tiestä, Pohjan peltojen periltä",
      );
    });
  });

  describe("when given multiple sources", () => {
    it("generates expected output for small max token size", () => {
      const generator = new TrigramGenerator({ seed: 245 });
      generator.addSource(frankensteinText);
      generator.addSource(kalevalaText);
      generator.finalize();
      const result = generator.generate({ maxTokens: 100 });
      expect(result).toStrictEqual(
        "surpassing in wonders and in beauty every region hitherto discovered on the habitable globe. Its productions and features may be wafted to a land surpassing in wonders and in the success of my welfare and increasing confidence in the streets of Petersburgh, Dec. 11 th, 17—. You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my undertaking. I am already far north",
      );
    });

    it("generates expected output for large max token size", () => {
      const generator = new TrigramGenerator({ seed: 489 });
      generator.addSource(frankensteinText);
      generator.addSource(prideAndPrejudiceText);
      generator.addSource(kalevalaText);
      generator.finalize();
      const result = generator.generate({ maxTokens: 5000 });
      expect(result).toMatchSnapshot();
    });
  });
});
