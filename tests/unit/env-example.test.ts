import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { envSchema } from "../../src/config";

function keysIn(file: string): string[] {
  return readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.match(/^#?\s*([A-Z_][A-Z0-9_]*)=/)?.[1])
    .filter((key): key is string => key !== undefined);
}

describe(".env.example", () => {
  it("config-in bildiyi hər dəyişən .env.example-də var", () => {
    const documented = keysIn(".env.example");
    const required = Object.keys(envSchema.shape);

    const missing = required.filter((key) => !documented.includes(key));
    expect(missing).toEqual([]);
  });

  it(".env.example-də config-in tanımadığı dəyişən yoxdur", () => {
    const known = Object.keys(envSchema.shape);

    const unknown = keysIn(".env.example").filter((key) => !known.includes(key));
    expect(unknown).toEqual([]);
  });
});
