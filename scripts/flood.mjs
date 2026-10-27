const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const N = Number(process.argv[2] ?? 30);

const results = await Promise.all(
  Array.from({ length: N }, () =>
    fetch(`${BASE}/debug/random`).then((r) => ({
      status: r.status,
      id: r.headers.get("x-request-id"),
    })),
  ),
);

const failed = results.filter((r) => r.status >= 500);
console.log(`${N} sorğu göndərildi · ${failed.length} xəta`);
for (const f of failed) {
  console.log(`  ${f.status}  X-Request-Id: ${f.id ?? "YOXDUR"}`);
}
