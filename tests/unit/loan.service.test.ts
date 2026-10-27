import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = vi.hoisted(() => ({
  book: { updateMany: vi.fn(), findUnique: vi.fn() },
  loan: { create: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (client: typeof tx) => unknown) => fn(tx),
  },
}));

import { borrowBook } from "../../src/services/loan.service";
import { ConflictError, NotFoundError } from "../../src/lib/errors";

describe("borrowBook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("nüsxə varsa loan yaradır", async () => {
    tx.book.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.create.mockResolvedValue({ id: 10, bookId: 1, borrowedAt: new Date() });

    const loan = await borrowBook(1, 7);

    expect(loan.id).toBe(10);
    expect(tx.loan.create).toHaveBeenCalledOnce();
  });

  it("nüsxə sayını şərtli azaldır — race condition müdafiəsi", async () => {
    tx.book.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.create.mockResolvedValue({ id: 10, bookId: 1, borrowedAt: new Date() });

    await borrowBook(1, 7);

    expect(tx.book.updateMany).toHaveBeenCalledWith({
      where: { id: 1, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } },
    });
  });

  it("kitab yoxdursa NotFoundError atır", async () => {
    tx.book.updateMany.mockResolvedValue({ count: 0 });
    tx.book.findUnique.mockResolvedValue(null);

    await expect(borrowBook(999, 7)).rejects.toThrow(NotFoundError);
    expect(tx.loan.create).not.toHaveBeenCalled();
  });

  it("nüsxə bitibsə ConflictError atır", async () => {
    tx.book.updateMany.mockResolvedValue({ count: 0 });
    tx.book.findUnique.mockResolvedValue({ id: 1 });

    await expect(borrowBook(1, 7)).rejects.toThrow(ConflictError);
    expect(tx.loan.create).not.toHaveBeenCalled();
  });
});
