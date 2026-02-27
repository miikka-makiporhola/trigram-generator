import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  treeshake: true,

  // For a single-entry pure library, keep it simple:
  splitting: false,
  minify: false,

  // Prefer not to bundle dependencies for a library
  // (leave deps external by default)
  external: [],
});
