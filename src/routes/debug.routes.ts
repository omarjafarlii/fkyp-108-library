import { Router } from "express";

const router = Router();

router.get("/random", (_req, res) => {
  if (Math.random() < 0.1) {
    throw new Error("Təsadüfi xəta: stock insufficient");
  }
  res.json({ ok: true });
});

router.get("/slow", async (req, res) => {
  const ms = Math.min(Number(req.query.ms) || 200, 30_000);
  await new Promise((r) => setTimeout(r, ms));
  res.json({ ok: true, ms });
});

router.get("/boom", async () => {
  throw new Error(
    "Bağlantı alınmadı: postgresql://postgres:password@127.0.0.1:5432/lesson29",
  );
});

export default router;
