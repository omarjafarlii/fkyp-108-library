import { prisma } from "../lib/prisma";
import { ConflictError, NotFoundError } from "../lib/errors";

export async function getBookStatus(bookId: number) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      availableCopies: true,
      _count: { select: { loans: { where: { returnedAt: null } } } },
    },
  });

  if (!book) throw new NotFoundError("Kitab");
  return book;
}

export async function borrowBook(bookId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.book.updateMany({
      where: { id: bookId, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } },
    });

    if (count === 0) {
      const exists = await tx.book.findUnique({ where: { id: bookId }, select: { id: true } });
      if (!exists) throw new NotFoundError("Kitab");
      throw new ConflictError("Bu kitabın boş nüsxəsi qalmayıb", "NO_COPIES_LEFT");
    }

    return tx.loan.create({
      data: { bookId, userId },
      select: { id: true, bookId: true, borrowedAt: true },
    });
  });
}

export async function returnLoan(loanId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.loan.updateMany({
      where: { id: loanId, userId, returnedAt: null },
      data: { returnedAt: new Date() },
    });

    if (count === 0) {
      const loan = await tx.loan.findFirst({ where: { id: loanId, userId }, select: { id: true } });
      if (!loan) throw new NotFoundError("Götürülmüş kitab");
      throw new ConflictError("Bu kitab artıq qaytarılıb", "ALREADY_RETURNED");
    }

    const loan = await tx.loan.findUniqueOrThrow({ where: { id: loanId }, select: { bookId: true } });
    await tx.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    return { id: loanId, returned: true };
  });
}
