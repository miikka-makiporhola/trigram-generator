import { TrigramGenerator } from "./dist/index.js";

const sourcesEl = document.querySelector("#sources");
const sourceCountEl = document.querySelector("#sourceCount");
const seedEl = document.querySelector("#seed");
const maxTokensEl = document.querySelector("#maxTokens");
const statusEl = document.querySelector("#status");
const outputEl = document.querySelector("#output");
const sources = [];

function setStatus(text) {
  statusEl.textContent = text;
}

function updateSourceCount() {
  sourceCountEl.textContent = `Sources added: ${sources.length}`;
}

function addSource() {
  const text = sourcesEl.value.trim();
  if (text.length === 0) {
    setStatus("Paste source text before adding.");
    return;
  }

  sources.push(text);
  sourcesEl.value = "";
  updateSourceCount();
  setStatus(`Added source ${sources.length}.`);
}

function parseSeed() {
  const raw = seedEl.value.trim();
  if (raw.length === 0) {
    return undefined;
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new Error("Seed must be an integer.");
  }

  return value;
}

function parseMaxTokens() {
  const value = Number(maxTokensEl.value);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Max tokens must be a positive integer.");
  }

  return value;
}

function generate() {
  outputEl.textContent = "";

  try {
    if (sources.length === 0) {
      throw new Error("Add at least one non-empty source.");
    }

    const seed = parseSeed();
    const maxTokens = parseMaxTokens();
    const generator = new TrigramGenerator(seed === undefined ? {} : { seed });

    for (const source of sources) {
      generator.addSource(source);
    }

    const pairCount = generator.getTransitionList().length;
    generator.finalize();

    const text = generator.generate({ maxTokens });
    outputEl.textContent = text || "(No output. Try longer sources.)";
    setStatus(`Generated with ${sources.length} source(s), ${pairCount} transition pair(s).`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unexpected error");
  }
}

function clearOutput() {
  outputEl.textContent = "";
  setStatus("");
}

document.querySelector("#addSource")?.addEventListener("click", addSource);
document.querySelector("#generate")?.addEventListener("click", generate);
document.querySelector("#clear")?.addEventListener("click", clearOutput);
