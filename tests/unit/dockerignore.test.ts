import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const rules = readFileSync(".dockerignore", "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "" && !line.startsWith("#"));

describe(".dockerignore", () => {
  it("secret faylları image-ə düşmür", () => {
    expect(rules).toContain(".env");
    expect(rules).toContain(".env.*");
  });

  it("host-un node_modules və build nəticələri context-ə düşmür", () => {
    expect(rules).toEqual(expect.arrayContaining(["node_modules", "dist", "src/generated"]));
  });
});
