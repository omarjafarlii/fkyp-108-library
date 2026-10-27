import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type { ProfileInput } from "../schemas/profile.schema";

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { select: { displayName: true, bio: true } },
    },
  });

  if (!user) throw new NotFoundError("İstifadəçi");
  return user;
}

export async function upsertProfile(userId: number, data: ProfileInput) {
  return prisma.profile.upsert({
    where: { userId },
    create: { ...data, userId },
    update: data,
    select: { displayName: true, bio: true },
  });
}
