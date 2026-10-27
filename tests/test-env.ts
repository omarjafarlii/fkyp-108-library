import { readFileSync } from "node:fs";
import { parse } from "dotenv";

export function loadTestEnv(): Record<string, string> {
  const env = parse(readFileSync(".env.test"));

  if (!env.DATABASE_URL) {
    throw new Error(".env.test faylında DATABASE_URL yoxdur");
  }

  const dbName = new URL(env.DATABASE_URL).pathname.slice(1);
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Testlər yalnız adı _test ilə bitən bazada işləyir. .env.test-dəki baza: "${dbName}"`,
    );
  }

  return env;
}
