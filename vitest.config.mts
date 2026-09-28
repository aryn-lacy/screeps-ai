import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // The bot source imports its own modules relative to src/ ("utils/...",
    // "roles/...") via the tsconfig `paths` mapping. Vite does not read that,
    // so mirror it here.
    alias: {
      roles: resolve(import.meta.dirname, "src/roles"),
      utils: resolve(import.meta.dirname, "src/utils"),
    },
  },
  test: {
    // Unit tests only - test/integration needs screeps-server-mockup, see docs.
    include: ["test/unit/**/*.test.ts"],
    setupFiles: ["test/setup-vitest.ts"],
  },
});