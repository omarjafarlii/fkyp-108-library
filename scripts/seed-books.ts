import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const AUTHORS = ["Nizami", "Füzuli", "Nəsimi", "Vaqif", "Sabir"];
const TITLES = [
  "Qızıl açar", "İsmayıllı xatirələri", "Şuşa gecələri", "Bakı küləkləri",
  "Dağların səsi", "Işıqlı yol", "Xəzər sahili", "Köhnə şəhər", "Gecə qatarı", "Son məktub",
];
const COUNT = Number(process.argv[2] ?? 200);

const user = await prisma.user.findFirst({ orderBy: { id: "asc" } });
if (!user) {
  console.log("Bazada istifadəçi yoxdur. Əvvəlcə POST /auth/register ilə qeydiyyatdan keç.");
  process.exit(1);
}

const authors = [];
for (const name of AUTHORS) {
  authors.push(
    await prisma.author.upsert({
      where: { userId_name: { userId: user.id, name } },
      create: { name, country: "AZ", userId: user.id },
      update: {},
    }),
  );
}

await prisma.book.createMany({
  data: Array.from({ length: COUNT }, (_, i) => ({
    title: `${TITLES[i % TITLES.length]} ${Math.floor(i / TITLES.length) + 1}`,
    year: 1950 + (i % 30),
    availableCopies: i % 4,
    authorId: authors[i % authors.length].id,
  })),
});

const total = await prisma.book.count();
console.log(`${COUNT} kitab əlavə olundu. Bazada cəmi: ${total}`);
await prisma.$disconnect();
