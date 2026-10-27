import jwt from "jsonwebtoken";
import type { Role } from "../generated/prisma/client";
import { config } from "../config";

export type TokenPayload = {
  sub: number;
  email: string;
  role: Role;
};

export const TOKEN_TTL = "15m";
export const ALGORITHM = "HS256" as const;

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, {
    algorithms: [ALGORITHM],
  });

  if (typeof decoded === "string") {
    throw new Error("Gözlənilməz token formatı");
  }

  // İmza yoxlanılıb — payload-ı bizim server yaradıb.
  // jsonwebtoken `sub`-u string kimi tipləyir, biz number işlədirik,
  // ona görə `unknown` üzərindən çeviririk.
  return decoded as unknown as TokenPayload;
}
