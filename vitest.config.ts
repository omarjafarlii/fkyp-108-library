import { defineConfig } from "vitest/config";
import { loadTestEnv } from "./tests/test-env.ts";

export default defineConfig({
  test: {
    env: loadTestEnv(),
    globalSetup: ["./tests/global-setup.ts"],
    fileParallelism: false,
  },
});
