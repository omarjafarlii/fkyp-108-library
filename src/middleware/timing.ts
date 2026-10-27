import type { RequestHandler } from "express";

export const timing: RequestHandler = (req, res, next) => {
  const start = performance.now();

  res.on("finish", () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`[${req.id}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
};
