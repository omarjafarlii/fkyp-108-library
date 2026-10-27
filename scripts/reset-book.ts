import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const bookId = Number(process.argv[2] ?? 1);
const copies = Number(process.argv[3] ?? 1);

await prisma.loan.deleteMany({ where: { bookId } });
await prisma.book.update({ where: { id: bookId }, data: { availableCopies: copies } });
console.log(`Kitab #${bookId}: nüsxə = ${copies}, loan-lar silindi`);
await prisma.$disconnect();
