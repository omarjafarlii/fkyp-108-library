import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { resetDb } from "../helpers/db";
import { createBook, createUser } from "../helpers/factories";
import { bearer } from "../helpers/auth";
import {
  BookFeedSchema,
  BookListSchema,
  BookStatusSchema,
  ErrorResponseSchema,
  LoanSchema,
  LoginResponseSchema,
  PublicUserSchema,
} from "../../src/docs/schemas";

// Sənəddəki schema ilə əsl cavabı müqayisə edirik.
// strictObject: sənəddə olmayan artıq sahə də xətadır (məs. passwordHash).
describe("Contract — cavablar sənədə uyğundur", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /books → BookList", async () => {
    await createBook();
    await createBook();

    const res = await request(app).get("/books");

    expect(res.status).toBe(200);
    BookListSchema.parse(res.body);
  });

  it("GET /books/{id} → BookStatus", async () => {
    const book = await createBook();

    const res = await request(app).get(`/books/${book.id}`);

    expect(res.status).toBe(200);
    BookStatusSchema.parse(res.body);
  });

  it("POST /auth/login → LoginResponse", async () => {
    await createUser({ email: "ali@test.az", password: "parol12345" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ali@test.az", password: "parol12345" });

    expect(res.status).toBe(200);
    LoginResponseSchema.parse(res.body);
  });

  it("POST /books/{id}/borrow → Loan", async () => {
    const book = await createBook();
    const user = await createUser();

    const res = await request(app)
      .post(`/books/${book.id}/borrow`)
      .set("Authorization", bearer("USER", user.id));

    expect(res.status).toBe(201);
    LoanSchema.parse(res.body);
  });

  it("POST /auth/register → PublicUser", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "ali@test.az", password: "parol12345" });

    expect(res.status).toBe(201);
    PublicUserSchema.parse(res.body);
  });

  it("GET /books/feed → BookFeed", async () => {
    await createBook();

    const res = await request(app).get("/books/feed");

    expect(res.status).toBe(200);
    BookFeedSchema.parse(res.body);
  });

  it("400 xətası → ErrorResponse", async () => {
    const res = await request(app).get("/books?limit=abc");

    expect(res.status).toBe(400);
    ErrorResponseSchema.parse(res.body);
  });
});
