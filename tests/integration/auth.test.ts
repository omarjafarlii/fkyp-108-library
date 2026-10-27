import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const db = vi.hoisted(() => ({
  user: { create: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { registerLimiter } from "../../src/middleware/rate-limit";

describe("POST /auth/register", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    await registerLimiter.resetKey("127.0.0.1");
  });

  it("email formatı səhvdirsə 400 qaytarır", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "salam", password: "parol12345" });

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe("email");
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("parol 8 simvoldan qısadırsa 400 qaytarır", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "ali@test.az", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe("password");
  });

  it("email artıq varsa 409 EMAIL_TAKEN qaytarır", async () => {
    db.user.create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002" }));

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "ali@test.az", password: "parol12345" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("uğurlu qeydiyyat 201 qaytarır, email kiçildilir, hash seçilmir", async () => {
    db.user.create.mockResolvedValue({ id: 1, email: "ali@test.az", createdAt: new Date() });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "  Ali@Test.AZ ", password: "parol12345" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("ali@test.az");
    expect(db.user.create).toHaveBeenCalledWith({
      data: { email: "ali@test.az", passwordHash: expect.any(String) },
      select: { id: true, email: true, createdAt: true },
    });
  });
});
