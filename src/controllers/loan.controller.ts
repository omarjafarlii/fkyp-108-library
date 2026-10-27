import type { Request, Response } from "express";
import * as loanService from "../services/loan.service";
import { idParamSchema } from "../schemas/common.schema";

export async function returnLoan(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await loanService.returnLoan(id, req.user!.sub));
}
