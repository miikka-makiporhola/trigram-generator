export interface TrigramGenerationOptions {
  maxTokens: number;
}

export interface TrigramGeneratorOptions {
  seed?: number;
}

const TRIGRAM_SIZE = 3;
const PAIR_KEY_DELIMITER = "|";

export class TrigramGenerator {
  // Deduplicates token strings to compact numeric IDs used in transition lists used during training.
  private readonly tokenToId = new Map<string, number>();

  // Reverse lookup from token ID back to original token text.
  private readonly idToToken: string[] = [];

  // Mutable training-time transitions: "id1|id2" -> list of next-token IDs.
  private readonly transitionLists = new Map<string, number[]>();

  private readonly pairOrder: string[] = [];
  private readonly seed?: number;

  private finalizedTransitions: ReadonlyMap<string, Int32Array> | null = null;
  private startPair: string | null = null;
  private isFinalized = false;

  public constructor(options: TrigramGeneratorOptions = {}) {
    this.seed = options.seed;
  }

  private getTokenIdPairKey(first: number, second: number): string {
    return `${first}${PAIR_KEY_DELIMITER}${second}`;
  }

  private unpackTokenIdPairKey(key: string): [number, number] {
    const keyDividerIndex = key.indexOf(PAIR_KEY_DELIMITER);
    const first = Number(key.slice(0, keyDividerIndex));
    const second = Number(key.slice(keyDividerIndex + 1));
    return [first, second];
  }

  private addOrCreateTokenId(token: string): number {
    const existing = this.tokenToId.get(token);
    if (existing !== undefined) {
      return existing;
    }

    const id = this.idToToken.length;
    this.tokenToId.set(token, id);
    this.idToToken.push(token);
    return id;
  }

  private createTransitionList(tokens: string[]): void {
    const validTokenWindow = tokens.length - TRIGRAM_SIZE;

    for (let i = 0; i <= validTokenWindow; i += 1) {
      const tokenRange = tokens.slice(i, i + TRIGRAM_SIZE);
      const [first, second, third] = tokenRange.map((token) => this.addOrCreateTokenId(token));

      const key = this.getTokenIdPairKey(first, second);
      let list = this.transitionLists.get(key);
      if (list === undefined) {
        list = [];
        this.transitionLists.set(key, list);
        this.pairOrder.push(key);
      }
      list.push(third);
    }
  }

  private tokenize(source: string): string[] {
    /**
     * Tokenization regex (Unicode-aware):
     * - \p{L}[\p{L}\p{N}'-]* : a word token that starts with a letter and may continue
     *   with letters, digits, apostrophes, or hyphens (for example: "mökki", "don't", "x-12").
     * - \p{N}+ : a numeric token (for example: "2026").
     * - [^\s\p{L}\p{N}] : any non-whitespace character that is not a letter/number,
     *   captured as its own token (for example: ".", ",", "!", "?").
     *
     * Flags:
     * - g: find all matches, not just the first
     * - u: enable Unicode character classes so letters like ö/ä/å are treated as letters
     */
    return source.match(/\p{L}[\p{L}\p{N}'-]*|\p{N}+|[^\s\p{L}\p{N}]/gu) ?? [];
  }

  public addSource(source: string): void {
    if (this.isFinalized) {
      throw new Error("Cannot add source after finalize");
    }

    const tokens = this.tokenize(source);
    if (tokens.length < TRIGRAM_SIZE) {
      return;
    }

    this.createTransitionList(tokens);
  }

  private getGenerationStartPair(): string | null {
    if (this.pairOrder.length === 0) {
      return null;
    }

    const pairCount = this.pairOrder.length;

    if (this.seed !== undefined) {
      return this.pairOrder[Math.abs(this.seed) % pairCount];
    }

    return this.pairOrder[Math.floor(Math.random() * pairCount)];
  }

  public finalize(): void {
    if (this.isFinalized) {
      return;
    }

    const frozenTransitions = new Map<string, Int32Array>();

    for (const [key, list] of this.transitionLists) {
      frozenTransitions.set(key, Int32Array.from(list));
    }

    this.finalizedTransitions = frozenTransitions;
    this.transitionLists.clear();
    this.startPair = this.getGenerationStartPair();
    this.isFinalized = true;
  }

  private generateTokens(
    startPair: string,
    firstId: number,
    secondId: number,
    maxTokens: number,
  ): string[] {
    const tokens = [this.idToToken[firstId], this.idToToken[secondId]];
    const transitionCursorByPair = new Map<string, number>();

    let currentKey = startPair;

    while (tokens.length < maxTokens) {
      const availableTransitions = this.finalizedTransitions?.get(currentKey);

      if (availableTransitions === undefined || availableTransitions.length === 0) {
        break;
      }

      const cursor = transitionCursorByPair.get(currentKey) ?? 0;
      const transitionTokenId = availableTransitions[cursor];
      transitionCursorByPair.set(currentKey, (cursor + 1) % availableTransitions.length);

      tokens.push(this.idToToken[transitionTokenId]);
      const [, secondTokenId] = this.unpackTokenIdPairKey(currentKey);
      currentKey = this.getTokenIdPairKey(secondTokenId, transitionTokenId);
    }

    return tokens;
  }

  private formatOutput(tokens: string[]): string {
    return tokens.reduce((prev, token) => {
      if (prev.length === 0) {
        return token;
      }
      if (this.isPunctuationToken(token)) {
        return prev + token;
      }
      return prev + ` ${token}`;
    }, "");
  }

  private isPunctuationToken(token: string): boolean {
    return /^[^\s\p{L}\p{N}]+$/u.test(token);
  }

  public generate({ maxTokens }: TrigramGenerationOptions): string {
    if (!this.isFinalized) {
      throw new Error("Sources must be finalized before generating tokens");
    }

    if (this.startPair === null || this.finalizedTransitions === null || maxTokens <= 0) {
      return "";
    }

    const [firstId, secondId] = this.unpackTokenIdPairKey(this.startPair);
    const tokens = this.generateTokens(this.startPair, firstId, secondId, maxTokens);
    return this.formatOutput(tokens);
  }
}
