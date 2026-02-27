# trigram-generator

A small TypeScript library for building a trigram language model from input text and generating deterministic or random token sequences.

## Features

- Trigram-based generation (`2-token context -> next token`)
- Unicode-aware tokenization
- Punctuation preserved as tokens
- Output formatting without spaces before punctuation
- Optional deterministic seed for reproducible generation
- Finalization step that freezes training data for faster generation reads

## Installation

```bash
npm install trigram-generator
```

## Usage

```ts
import { TrigramGenerator } from "trigram-generator";

const generator = new TrigramGenerator({ seed: 357 });

generator.addSource("I wish I may I wish I might.");
generator.addSource("I may follow where the trigram leads.");

const transitions = generator.getTransitionList();

generator.finalize();

const text = generator.generate({ maxTokens: 30 });
console.log(text);
```

## API

### `new TrigramGenerator(options?)`

Creates a new generator.

Options:

- `seed?: number`
  - If provided, the start pair is selected deterministically.
  - If omitted, the start pair is selected randomly.

### `addSource(source: string): void`

Adds training text.

Notes:

- Can be called multiple times before `finalize()`.
- Throws if called after `finalize()`.
- Inputs with fewer than 3 tokens are ignored.

### `getTransitionList(): Array<{ pair: [string, string]; nextTokens: string[] }>`

Returns the current trigram transition list as token strings.

Notes:

- Includes transitions from all added sources in insertion order.
- Keeps duplicate next tokens to preserve transition frequency.
- Can be called before or after `finalize()`.

### `finalize(): void`

Freezes the internal dataset for generation.

What it does:

- Converts mutable transition lists into compact typed arrays (`Int32Array`)
- Clears mutable training structures
- Selects the generation start pair (seeded or random)

`finalize()` is idempotent.

### `generate(options: { maxTokens: number }): string`

Generates text from the finalized model.

Rules:

- Throws if called before `finalize()`
- Returns `""` when there is no usable model or `maxTokens <= 0`
- Uses round-robin transition selection per token pair
- Preserves punctuation spacing (no extra space before punctuation marks)

## Tokenization

The tokenizer is Unicode-aware and uses this pattern:

```txt
\p{L}[\p{L}\p{N}'-]* | \p{N}+ | [^\s\p{L}\p{N}]
```

Meaning:

- Word tokens starting with a letter, optionally continuing with letters/numbers/apostrophes/hyphens
- Number tokens
- Standalone punctuation/symbol tokens

Examples:

- `"don't"` -> one token
- `"x-12"` -> one token
- `"hello, world!"` -> `hello`, `,`, `world`, `!`

## Development

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Browser Playground (GitHub Pages)

This repository includes a static demo app in `site/` that lets you:

- Paste one or more source texts
- Set an optional numeric seed
- Generate output with configurable max token count

### Run locally

```bash
npm run build
rm -rf public
mkdir -p public/dist
cp -R site/. public/
cp -R dist/. public/dist/
python3 -m http.server --directory public 4173
```

Then open `http://localhost:4173`.

### Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open repository settings -> Pages.
3. Set Source to `GitHub Actions`.
4. Push to the `main` branch (or run the "Deploy Demo (GitHub Pages)" workflow manually).

After deployment, the demo is available at:

`https://<your-username>.github.io/<your-repository-name>/`

## Test Fixtures

Large book fixtures used by tests are documented in:

- `test/fixtures/README.md`

That document includes source links and fixture preprocessing policy.
