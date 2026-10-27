import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter, log: config.NODE_ENV === "test" ? [] : ["query"] });

if (config.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
