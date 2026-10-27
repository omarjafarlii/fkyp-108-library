import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

export async function register(req: Request, res: Response) {
  const { email, password } = registerSchema.parse(req.body);
  res.status(201).json(await authService.registerUser(email, password));
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  res.json(await authService.loginUser(email, password));
}
