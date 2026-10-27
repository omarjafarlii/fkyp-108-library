import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { resetDb } from "../helpers/db";
import { createBook, createUser } from "../helpers/factories";
import { bearer } from "../helpers/auth";

describe("Loans — əsl baza ilə", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("borrow nüsxə sayını azaldır və loan yaradır", async () => {
    const book = await createBook({ availableCopies: 2 });
    const user = await createUser();

    const res = await request(app)
      .post(`/books/${book.id}/borrow`)
      .set("Authorization", bearer("USER", user.id));

    expect(res.status).toBe(201);

    const after = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(after.availableCopies).toBe(1);
    expect(await prisma.loan.count({ where: { bookId: book.id, userId: user.id } })).toBe(1);
  });

  it("son nüsxə: 10 paralel borrow — yalnız biri uğurlu", async () => {
    const book = await createBook({ availableCopies: 1 });
    const user = await createUser();
    const auth = bearer("USER", user.id);

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app).post(`/books/${book.id}/borrow`).set("Authorization", auth),
      ),
    );

    const statuses = responses.map((r) => r.status).sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409, 409, 409, 409, 409, 409, 409, 409, 409]);

    const after = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(after.availableCopies).toBe(0);
    expect(await prisma.loan.count({ where: { bookId: book.id } })).toBe(1);
  });

  it("qaytarılan kitab nüsxəni geri artırır", async () => {
    const book = await createBook({ availableCopies: 1 });
    const user = await createUser();
    const auth = bearer("USER", user.id);

    const borrowed = await request(app).post(`/books/${book.id}/borrow`).set("Authorization", auth);
    const res = await request(app).post(`/loans/${borrowed.body.id}/return`).set("Authorization", auth);

    expect(res.status).toBe(200);
    const after = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(after.availableCopies).toBe(1);
  });
});
