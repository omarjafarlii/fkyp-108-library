import type { RequestHandler } from "express";
import { verifyToken } from "../lib/jwt";
import { UnauthorizedError } from "../lib/errors";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token təqdim edilməyib");
  }

  try {
    req.user = verifyToken(header.slice(7));
  } catch {
    throw new UnauthorizedError("Token etibarsızdır");
  }

  next();
};
