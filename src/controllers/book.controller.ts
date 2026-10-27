import type { Request, Response } from "express";
import { rm } from "node:fs/promises";
import { ValidationError } from "../lib/errors";
import * as loanService from "../services/loan.service";
import * as bookService from "../services/book.service";
import { idParamSchema } from "../schemas/common.schema";
import { feedQuerySchema, listBooksQuerySchema } from "../schemas/book.schema";

export async function getBook(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await loanService.getBookStatus(id));
}

export async function borrow(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.status(201).json(await loanService.borrowBook(id, req.user!.sub));
}

export async function listBooks(req: Request, res: Response) {
  const query = listBooksQuerySchema.parse(req.query);
  res.json(await bookService.listBooks(query));
}

export async function feed(req: Request, res: Response) {
  const query = feedQuerySchema.parse(req.query);
  res.json(await bookService.feedBooks(query));
}

export async function uploadCover(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    if (!req.file) {
      throw new ValidationError("Fayl göndərilməyib: cover sahəsində şəkil gözlənilir");
    }
    res.json(await bookService.setCover(id, req.user!.sub, req.file));
  } catch (err) {
    if (req.file) await rm(req.file.path, { force: true });
    throw err;
  }
}

export async function deleteCover(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await bookService.removeCover(id, req.user!.sub);
  res.status(204).end();
}
