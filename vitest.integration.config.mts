import { defineConfig } from "vitest/config";

// Opt-in suite: requires `screeps-server-mockup` to be installed, see
// docs/in-depth/testing.md. Run it with `pnpm run test-integration`.
export default defineConfig({
  test: {
    include: ["test/integration/**/*.test.ts"],
    // Booting a real private server for each test file is slow.
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});