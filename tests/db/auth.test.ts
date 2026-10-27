import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { resetDb } from "../helpers/db";
import { createUser } from "../helpers/factories";

describe("Auth — əsl baza ilə", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("register istifadəçini yaradır, hash cavabda yoxdur", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "ali@test.az", password: "parol12345" });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("passwordHash");

    const row = await prisma.user.findUniqueOrThrow({ where: { email: "ali@test.az" } });
    expect(row.passwordHash).not.toBe("parol12345");
  });

  it("eyni email ikinci dəfə 409 EMAIL_TAKEN qaytarır", async () => {
    await createUser({ email: "ali@test.az" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "ali@test.az", password: "parol12345" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("login-dən gələn ADMIN token admin route-u açır", async () => {
    await createUser({ email: "admin@test.az", password: "gizli-parol-1", role: "ADMIN" });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "admin@test.az", password: "gizli-parol-1" });
    expect(login.status).toBe(200);

    const res = await request(app)
      .get("/admin/stats")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
  });

  it("səhv parol 401 qaytarır", async () => {
    await createUser({ email: "ali@test.az", password: "parol12345" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ali@test.az", password: "sehv-parol" });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Email və ya parol yanlışdır");
  });
});
