import type { Prisma } from "../generated/prisma/client";
import type { ListBooksQuery } from "../schemas/book.schema";

export type BookFilters = Pick<ListBooksQuery, "q" | "authorId" | "yearFrom" | "yearTo" | "available">;

export function buildWhere(q: BookFilters): Prisma.BookWhereInput {
  const where: Prisma.BookWhereInput = {};

  if (q.q) {
    where.title = { contains: q.q.toLocaleLowerCase("az"), mode: "insensitive" };
  }
  if (q.authorId) {
    where.authorId = q.authorId;
  }
  if (q.yearFrom !== undefined || q.yearTo !== undefined) {
    where.year = { gte: q.yearFrom, lte: q.yearTo };
  }
  if (q.available !== undefined) {
    where.availableCopies = q.available ? { gt: 0 } : 0;
  }

  return where;
}

export function buildOrderBy(
  q: Pick<ListBooksQuery, "sort" | "order">,
): Prisma.BookOrderByWithRelationInput[] {
  if (q.sort === "title") return [{ title: q.order }, { id: q.order }];
  if (q.sort === "year") return [{ year: q.order }, { id: q.order }];
  return [{ id: q.order }];
}
