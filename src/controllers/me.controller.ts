import type { Request, Response } from "express";
import * as profileService from "../services/profile.service";
import { profileSchema } from "../schemas/profile.schema";

export async function getMe(req: Request, res: Response) {
  res.json(await profileService.getMe(req.user!.sub));
}

export async function putProfile(req: Request, res: Response) {
  const input = profileSchema.parse(req.body);
  res.json(await profileService.upsertProfile(req.user!.sub, input));
}
