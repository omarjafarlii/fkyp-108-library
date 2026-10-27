import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

const VALID_ID = /^[\w-]{8,64}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  req.id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
};
