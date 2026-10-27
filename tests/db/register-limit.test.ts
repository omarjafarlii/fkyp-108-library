import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { registerLimiter } from "../../src/middleware/rate-limit";
import { resetDb } from "../helpers/db";

function register(n: number) {
  return request(app)
    .post("/auth/register")
    .send({ email: `user${n}@test.az`, password: "parol12345" });
}

describe("POST /auth/register — rate limit", () => {
  beforeEach(async () => {
    await resetDb();
    await registerLimiter.resetKey("127.0.0.1");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("bir IP-dən 3 qeydiyyat keçir, 4-cü 429 alır", async () => {
    for (let n = 1; n <= 3; n++) {
      expect((await register(n)).status).toBe(201);
    }

    const res = await register(4);

    expect(res.status).toBe(429);
    expect(await prisma.user.count()).toBe(3);
  });

  it("uğursuz qeydiyyat da sayılır", async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post("/auth/register").send({ email: "salam", password: "123" });
    }

    const res = await register(1);

    expect(res.status).toBe(429);
  });
});
