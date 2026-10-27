import { prisma } from "../../src/lib/prisma";

export async function resetDb() {
  await prisma.$executeRaw`TRUNCATE TABLE loans, books, profiles, authors, users RESTART IDENTITY CASCADE`;
}
