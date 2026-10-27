import { signToken } from "../../src/lib/jwt";
import type { Role } from "../../src/generated/prisma/client";

export function bearer(role: Role, userId = 7): string {
  const token = signToken({ sub: userId, email: `user${userId}@test.az`, role });
  return `Bearer ${token}`;
}
