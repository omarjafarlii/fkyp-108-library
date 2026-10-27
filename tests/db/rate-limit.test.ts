import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { loginLimiter } from "../../src/middleware/rate-limit";
import { resetDb } from "../helpers/db";
import { createUser } from "../helpers/factories";

function login(password: string) {
  return request(app).post("/auth/login").send({ email: "ali@test.az", password });
}

describe("POST /auth/login — rate limit", () => {
  beforeEach(async () => {
    await resetDb();
    await loginLimiter.resetKey("127.0.0.1");
    await createUser({ email: "ali@test.az", password: "parol12345" });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("5 səhv cəhddən sonra 6-cı 429 alır", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await login("sehv-parol")).status).toBe(401);
    }

    const res = await login("sehv-parol");

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("TOO_MANY_REQUESTS");
    expect(res.headers["retry-after"]).toBeDefined();
  });

  it("limit dolandan sonra düzgün parol da 429 alır — brute force dayanır", async () => {
    for (let i = 0; i < 5; i++) {
      await login("sehv-parol");
    }

    const res = await login("parol12345");

    expect(res.status).toBe(429);
  });

  it("uğurlu login-lər sayılmır", async () => {
    for (let i = 0; i < 7; i++) {
      expect((await login("parol12345")).status).toBe(200);
    }
  });
});
