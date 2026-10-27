import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";
import type { Role } from "../../src/generated/prisma/client";

let counter = 0;

export async function createUser(data: { email?: string; password?: string; role?: Role } = {}) {
  counter++;
  return prisma.user.create({
    data: {
      email: data.email ?? `user${counter}@test.az`,
      passwordHash: await bcrypt.hash(data.password ?? "parol12345", 4),
      role: data.role ?? "USER",
    },
  });
}

export async function createBook(
  data: { title?: string; availableCopies?: number; ownerId?: number } = {},
) {
  counter++;
  const ownerId = data.ownerId ?? (await createUser()).id;
  const author = await prisma.author.create({
    data: { name: `Müəllif ${counter}`, userId: ownerId },
  });
  return prisma.book.create({
    data: {
      title: data.title ?? `Kitab ${counter}`,
      year: 2000,
      availableCopies: data.availableCopies ?? 1,
      authorId: author.id,
    },
  });
}
