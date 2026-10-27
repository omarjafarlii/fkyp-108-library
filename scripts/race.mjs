const [bookId = "1", count = "20", token] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";

if (!token) {
  console.log("İstifadə: npm run race -- <bookId> <sorğu sayı> <token>");
  process.exit(1);
}

const results = await Promise.all(
  Array.from({ length: Number(count) }, () =>
    fetch(`${BASE}/books/${bookId}/borrow`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    }).then((r) => r.status),
  ),
);

const tally = results.reduce((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});
console.log(`${count} paralel sorğu:`, tally);

if (tally[401]) {
  console.log("Token etibarsızdır — yenidən login et və yeni tokeni ver.");
  process.exit(1);
}

const res = await fetch(`${BASE}/books/${bookId}`);
const book = await res.json();
if (!res.ok) {
  console.log("Kitab məlumatı alınmadı:", book.error?.message ?? res.status);
  process.exit(1);
}

console.log(`Kitabda qalan nüsxə: ${book.availableCopies}`);
console.log(`Aktiv loan sayı:     ${book._count.loans}`);
