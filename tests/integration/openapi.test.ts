import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("OpenAPI sənədi", () => {
  it("GET /openapi.json — 3.1 sənədi və əsas path-lər", async () => {
    const res = await request(app).get("/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        "/auth/register",
        "/auth/login",
        "/books",
        "/books/feed",
        "/books/{id}",
        "/books/{id}/borrow",
        "/books/{id}/cover",
      ]),
    );
  });

  it("path-lərdə Express yazılışı (:id) yoxdur", async () => {
    const res = await request(app).get("/openapi.json");

    const expressStyle = Object.keys(res.body.paths).filter((p) => p.includes(":"));
    expect(expressStyle).toEqual([]);
  });

  it("borrow və cover silmə sənəddə token tələb edir", async () => {
    const res = await request(app).get("/openapi.json");

    expect(res.body.paths["/books/{id}/borrow"].post.security).toEqual([{ bearerAuth: [] }]);
    expect(res.body.paths["/books/{id}/cover"].delete.security).toEqual([{ bearerAuth: [] }]);
    expect(res.body.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
  });

  it("GET /docs/ — Swagger UI səhifəsi açılır", async () => {
    const res = await request(app).get("/docs/");

    expect(res.status).toBe(200);
    expect(res.text).toContain('id="swagger-ui"');
  });

  it("lokal mühitdə CSP fayl linklərini https-ə çevirmir", async () => {
    const res = await request(app).get("/docs/");

    expect(res.headers["content-security-policy"]).not.toContain("upgrade-insecure-requests");
  });
});
