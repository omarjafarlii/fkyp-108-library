// Kiçik "frontend": http://localhost:5173 ünvanında bir HTML səhifə açır.
// Səhifə brauzerdən API-yə (http://127.0.0.1:3000) request göndərir — CORS-u görmək üçün.
// İşlətmək: node scripts/frontend.mjs   (port dəyişmək: node scripts/frontend.mjs 5174)
import http from "node:http";

const PORT = Number(process.argv[2] ?? 5173);
const API = "http://127.0.0.1:3000";

const html = `<!doctype html>
<html lang="az">
<head><meta charset="utf-8"><title>Kitabxana frontend · ${PORT}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; }
  button { padding: 8px 14px; margin: 4px 8px 4px 0; cursor: pointer; }
  input { padding: 6px; width: 260px; }
  pre { background: #f4f4f4; padding: 12px; white-space: pre-wrap; min-height: 60px; }
  img { max-width: 120px; border: 1px solid #ccc; display: block; margin-top: 8px; }
</style></head>
<body>
  <h1>Kitabxana frontend</h1>
  <p>Bu səhifənin origin-i: <b id="origin"></b> · API: <b>${API}</b></p>

  <h3>1. Kitablar</h3>
  <button id="books">GET /books</button>

  <h3>2. Login</h3>
  <input id="email" placeholder="email" value="ali@test.az">
  <input id="password" placeholder="parol" value="parol12345" type="password">
  <button id="login">POST /auth/login</button>

  <h3>3. Üz qabığı şəkli</h3>
  <input id="cover" placeholder="/uploads/....png">
  <button id="showCover">Şəkli göstər</button>
  <img id="img" alt="">

  <h3>Nəticə</h3>
  <pre id="out">Düyməyə bas. Xəta olsa, DevTools → Console-a da bax (F12).</pre>

<script>
  const out = document.getElementById("out");
  document.getElementById("origin").textContent = location.origin;
  const show = (text) => { out.textContent = text; };

  async function call(path, options) {
    try {
      const res = await fetch("${API}" + path, options);
      const body = await res.text();
      show("Status: " + res.status + "\\n\\n" + body);
    } catch (err) {
      show("XƏTA: " + err.message + "\\n\\nBrauzer cavabı JavaScript-ə vermədi. Console-a bax.");
    }
  }

  document.getElementById("books").onclick = () => call("/books?limit=3");
  document.getElementById("login").onclick = () => call("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }),
  });
  document.getElementById("showCover").onclick = () => {
    const img = document.getElementById("img");
    img.onload = () => show("Şəkil yükləndi.");
    img.onerror = () => show("Şəkil yüklənmədi. Console-a bax.");
    img.src = "${API}" + document.getElementById("cover").value;
  };
</script>
</body></html>`;

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  })
  .listen(PORT, () => console.log(`Frontend: http://localhost:${PORT}`));
