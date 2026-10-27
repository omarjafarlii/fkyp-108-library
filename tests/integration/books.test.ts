import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const db = vi.hoisted(() => ({
  book: { findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
  loan: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { bearer } from "../helpers/auth";

describe("Books API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("GET /books — query mətnini rəqəmə çevirir və meta qaytarır", async () => {
    db.$transaction.mockResolvedValue([[{ id: 21, title: "Xəmsə" }], 41]);

    const res = await request(app).get("/books?page=2");

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 2, limit: 20, total: 41, totalPages: 3 });
    expect(db.book.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20 }));
  });

  it("POST /books/:id/borrow — nüsxə bitibsə 409 NO_COPIES_LEFT", async () => {
    db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db));
    db.book.updateMany.mockResolvedValue({ count: 0 });
    db.book.findUnique.mockResolvedValue({ id: 1 });

    const res = await request(app).post("/books/1/borrow").set("Authorization", bearer("USER"));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("NO_COPIES_LEFT");
    expect(db.loan.create).not.toHaveBeenCalled();
  });

  it("POST /books/:id/borrow — userId token-dən gəlir", async () => {
    db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db));
    db.book.updateMany.mockResolvedValue({ count: 1 });
    db.loan.create.mockResolvedValue({ id: 5, bookId: 1, borrowedAt: new Date() });

    const res = await request(app).post("/books/1/borrow").set("Authorization", bearer("USER", 42));

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(5);
    expect(db.loan.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { bookId: 1, userId: 42 } }),
    );
  });
});
