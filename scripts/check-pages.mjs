const [sort = "id", limit = "20"] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";

const first = await fetch(`${BASE}/books?sort=${sort}&limit=${limit}&page=1`).then((r) => r.json());
if (first.error) {
  console.log("Xəta:", first.error.message);
  process.exit(1);
}

const ids = [];
for (let page = 1; page <= first.meta.totalPages; page++) {
  const res = await fetch(`${BASE}/books?sort=${sort}&limit=${limit}&page=${page}`).then((r) => r.json());
  ids.push(...res.data.map((b) => b.id));
}

const unique = new Set(ids).size;
console.log(`sort=${sort}: ${first.meta.totalPages} səhifə, ${ids.length} kitab alındı`);
console.log(`Unikal: ${unique} · Dublikat: ${ids.length - unique} · İtən: ${first.meta.total - unique}`);
