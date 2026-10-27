import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { Role } from "../generated/prisma/client";
import type { Author } from "../generated/prisma/client";
import type { CreateAuthorInput, ListAuthorsQuery, UpdateAuthorInput } from "../schemas/author.schema";

type Actor = { sub: number; role: Role };

export async function getAllAuthors(query: ListAuthorsQuery): Promise<Author[]> {
  return prisma.author.findMany({
    where: query.country ? { country: query.country } : {},
    orderBy: { id: "asc" },
    take: query.limit,
  });
}

export async function createAuthor(data: CreateAuthorInput, userId: number): Promise<Author> {
  return prisma.author.create({ data: { ...data, userId } });
}

export async function findWithBooks(id: number, actor: Actor) {
  const author = await prisma.author.findFirst({
    where: actor.role === Role.ADMIN ? { id } : { id, userId: actor.sub },
    include: { books: { orderBy: { year: "desc" } } },
  });

  if (!author) throw new NotFoundError("Müəllif");
  return author;
}

export async function updateAuthor(id: number, data: UpdateAuthorInput, actor: Actor) {
  const { count } = await prisma.author.updateMany({
    where: actor.role === Role.ADMIN ? { id } : { id, userId: actor.sub },
    data,
  });

  if (count === 0) throw new NotFoundError("Müəllif");
  return findWithBooks(id, actor);
}

export async function deleteAuthor(id: number): Promise<void> {
  await prisma.author.delete({ where: { id } });
}
