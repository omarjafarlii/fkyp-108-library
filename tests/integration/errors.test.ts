import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("Xəta cavabları", () => {
  it("olmayan route 404 qaytarır", async () => {
    const res = await request(app).get("/yoxdur");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toBe("GET /yoxdur tapılmadı");
  });

  it("göndərilən X-Request-Id header-də və body-də geri qayıdır", async () => {
    const res = await request(app).get("/yoxdur").set("X-Request-Id", "test-request-123");

    expect(res.headers["x-request-id"]).toBe("test-request-123");
    expect(res.body.error.requestId).toBe("test-request-123");
  });

  it("səhv JSON 400 qaytarır", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("JSON formatı yanlışdır");
  });

  it("limit 50-dən çox olanda 400 və details qaytarır", async () => {
    const res = await request(app).get("/books?limit=100000");

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      { field: "limit", message: "limit ən çox 50 ola bilər" },
    ]);
  });
});
