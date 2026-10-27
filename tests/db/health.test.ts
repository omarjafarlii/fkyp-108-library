import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe("GET /health — əsl baza", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("test bazası ilə 200 və uptime", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.db).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });
});
