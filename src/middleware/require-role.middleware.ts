import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/client";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";

export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw new UnauthorizedError();
    if (!allowed.includes(req.user.role)) throw new ForbiddenError();
    next();
  };
}
