# AGENTS.md

This document defines stable, user-visible behavior and testing expectations for this repository.
It intentionally avoids implementation details so internals can evolve without changing product behavior.

## Core behavior contract

- The project builds a trigram language model from input text and generates text from that model.
- Model behavior is frequency-preserving: repeated transitions in training data should increase their relative occurrence in generated output.
- Multiple input sources are treated as one combined corpus.
- Generation must support both:
  - reproducible runs when a deterministic seed/config is provided, and
  - non-deterministic runs when deterministic controls are not provided.
- Generation requires a prepared/finalized model state before producing output.
- Empty or insufficient training input must be handled gracefully (no crashes, predictable empty/no-op behavior).

## Text handling contract

- Tokenization is Unicode-aware.
- Word-like tokens with apostrophes/hyphens should remain intact.
- Punctuation/symbol tokens are preserved.
- Output formatting must avoid introducing extra spaces before punctuation.
- The library must continue to work for multilingual text (including non-ASCII letters).

## Consistency expectations

- Deterministic configuration must produce stable output across runs on the same input.
- Transition/exposure data returned to users (if exposed) should reflect combined training data and preserve frequency information.
- Re-running generation from the same finalized model and deterministic setup should remain behaviorally consistent.

## Testing requirements

- Automated tests are required to guard core behavior.
- Test suite must include:
  - small deterministic examples with exact expected output,
  - larger real-text fixture coverage,
  - multilingual fixture coverage,
  - multi-source training coverage,
  - regression snapshot coverage for long-form output.
- If intended behavior changes, tests and snapshots must be updated in the same change with a clear reason.

## Quality gates

- Before merge/release, run:
  - `npm test`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- Publish/CI should fail when any gate fails.
