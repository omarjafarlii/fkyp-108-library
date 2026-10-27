import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("Helmet", () => {
  it("X-Powered-By header-i yoxdur", async () => {
    const res = await request(app).get("/yoxdur");

    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("təhlükəsizlik header-ləri əlavə olunub", async () => {
    const res = await request(app).get("/yoxdur");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});

describe("CORS", () => {
  it("icazəli origin Access-Control-Allow-Origin alır", async () => {
    const res = await request(app).get("/books?limit=abc").set("Origin", "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("icazəsiz origin header almır", async () => {
    const res = await request(app).get("/books?limit=abc").set("Origin", "http://evil.example");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("preflight: OPTIONS 204 və Authorization header-inə icazə", async () => {
    const res = await request(app)
      .options("/books/1/borrow")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "authorization,content-type");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-headers"]).toBe("authorization,content-type");
  });
});
