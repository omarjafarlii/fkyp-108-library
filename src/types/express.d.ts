import "express";
import type { Role } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        sub: number;
        email: string;
        role: Role;
      };
    }
  }
}
