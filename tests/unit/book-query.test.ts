import { describe, expect, it } from "vitest";
import { buildOrderBy, buildWhere } from "../../src/lib/book-query";

describe("buildOrderBy", () => {
  it("year üzrə sort-a id tie-breaker əlavə edir", () => {
    const result = buildOrderBy({ sort: "year", order: "asc" });
    expect(result).toEqual([{ year: "asc" }, { id: "asc" }]);
  });

  it("title üzrə sort-a id tie-breaker əlavə edir", () => {
    const result = buildOrderBy({ sort: "title", order: "desc" });
    expect(result).toEqual([{ title: "desc" }, { id: "desc" }]);
  });

  it("id üzrə sort-da tie-breaker lazım deyil", () => {
    const result = buildOrderBy({ sort: "id", order: "asc" });
    expect(result).toEqual([{ id: "asc" }]);
  });
});

describe("buildWhere", () => {
  it("filter yoxdursa boş obyekt qaytarır", () => {
    expect(buildWhere({})).toEqual({});
  });

  it("axtarış sözünü Azərbaycan qaydası ilə kiçildir", () => {
    const where = buildWhere({ q: "QIZIL" });
    expect(where.title).toEqual({ contains: "qızıl", mode: "insensitive" });
  });

  it("available=false nüsxəsi 0 olanları seçir", () => {
    expect(buildWhere({ available: false })).toEqual({ availableCopies: 0 });
  });

  it("available=true nüsxəsi 0-dan çox olanları seçir", () => {
    expect(buildWhere({ available: true })).toEqual({ availableCopies: { gt: 0 } });
  });

  it("yalnız yearFrom varsa yuxarı sərhəd undefined qalır", () => {
    expect(buildWhere({ yearFrom: 1960 })).toEqual({ year: { gte: 1960, lte: undefined } });
  });
});
