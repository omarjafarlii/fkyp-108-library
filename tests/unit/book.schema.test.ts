import { describe, expect, it } from "vitest";
import { listBooksQuerySchema } from "../../src/schemas/book.schema";

describe("listBooksQuerySchema", () => {
  it("heç nə göndərilməsə default dəyərləri verir", () => {
    const result = listBooksQuerySchema.parse({});
    expect(result).toEqual({ sort: "id", order: "asc", page: 1, limit: 20 });
  });

  it("mətni rəqəmə çevirir", () => {
    const result = listBooksQuerySchema.parse({ page: "3", limit: "10" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
  });

  it('"false" mətnini false edir', () => {
    const result = listBooksQuerySchema.parse({ available: "false" });
    expect(result.available).toBe(false);
  });

  it("limit 50-dən çox ola bilməz", () => {
    const result = listBooksQuerySchema.safeParse({ limit: "100000" });
    expect(result.success).toBe(false);
  });

  it("whitelist-də olmayan sort sahəsini rədd edir", () => {
    const result = listBooksQuerySchema.safeParse({ sort: "passwordHash" });
    expect(result.success).toBe(false);
  });

  it("yearFrom yearTo-dan böyük olanda xəta verir", () => {
    const result = listBooksQuerySchema.safeParse({ yearFrom: "1970", yearTo: "1960" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["yearFrom"]);
  });
});
