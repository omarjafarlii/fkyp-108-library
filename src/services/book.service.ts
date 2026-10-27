import path from "node:path";
import { rm } from "node:fs/promises";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import type { FeedQuery, ListBooksQuery } from "../schemas/book.schema";
import { buildOrderBy, buildWhere } from "../lib/book-query";
import { NotFoundError, ValidationError } from "../lib/errors";
import { detectImageType } from "../lib/image-type";
import { UPLOAD_DIR } from "../lib/upload";

const bookSelect = {
  id: true,
  title: true,
  year: true,
  availableCopies: true,
  author: { select: { id: true, name: true } },
} satisfies Prisma.BookSelect;

export async function listBooks(q: ListBooksQuery) {
  const where = buildWhere(q);

  const [data, total] = await prisma.$transaction([
    prisma.book.findMany({
      where,
      orderBy: buildOrderBy(q),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      select: bookSelect,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    data,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  };
}

export async function feedBooks(q: FeedQuery) {
  const rows = await prisma.book.findMany({
    where: {
      ...buildWhere(q),
      ...(q.cursor ? { id: { lt: q.cursor } } : {}),
    },
    orderBy: { id: "desc" },
    take: q.limit + 1,
    select: bookSelect,
  });

  const hasMore = rows.length > q.limit;
  const data = hasMore ? rows.slice(0, q.limit) : rows;

  return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
}

export async function setCover(bookId: number, userId: number, file: Express.Multer.File) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, author: { userId } },
    select: { id: true },
  });
  if (!book) throw new NotFoundError("Kitab");

  const realType = await detectImageType(file.path);
  if (realType !== file.mimetype) {
    throw new ValidationError("Faylın məzmunu şəkil deyil");
  }

  return prisma.book.update({
    where: { id: bookId },
    data: { coverUrl: `/uploads/${file.filename}` },
    select: { id: true, title: true, coverUrl: true },
  });
}

export async function removeCover(bookId: number, userId: number) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, author: { userId } },
    select: { id: true, coverUrl: true },
  });
  if (!book) throw new NotFoundError("Kitab");
  if (!book.coverUrl) throw new NotFoundError("Üz qabığı");

  await prisma.book.update({ where: { id: bookId }, data: { coverUrl: null } });
  await rm(path.join(UPLOAD_DIR, path.basename(book.coverUrl)), { force: true });
}
