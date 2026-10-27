import { authMiddleware } from "./auth.middleware";
import { requireRole } from "./require-role.middleware";
import { Role } from "../generated/prisma/client";

export const authenticated = [authMiddleware];
export const adminOnly = [authMiddleware, requireRole(Role.ADMIN)];
