import bcrypt from "bcryptjs";
import { signToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { isPrismaError, PrismaErrorCode } from "../lib/prisma-errors";
import { ConflictError, UnauthorizedError } from "../lib/errors";

export const SALT_ROUNDS = 10;

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", SALT_ROUNDS);

export type PublicUser = {
  id: number;
  email: string;
  createdAt: Date;
};

export async function registerUser(email: string, password: string): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });
  } catch (error: unknown) {
    if (isPrismaError(error, PrismaErrorCode.UNIQUE_VIOLATION)) {
      throw new ConflictError("Bu email artıq qeydiyyatdan keçib", "EMAIL_TAKEN");
    }
    throw error;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } });

  const hash = user?.passwordHash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw new UnauthorizedError("Email və ya parol yanlışdır");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    token,
  };
}
