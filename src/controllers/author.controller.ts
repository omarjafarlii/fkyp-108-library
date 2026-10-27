import type { Request, Response } from "express";
import * as authorService from "../services/author.service";
import { idParamSchema } from "../schemas/common.schema";
import { createAuthorSchema, listAuthorsQuerySchema, updateAuthorSchema } from "../schemas/author.schema";

export async function listAuthors(req: Request, res: Response) {
  const query = listAuthorsQuerySchema.parse(req.query);
  res.json(await authorService.getAllAuthors(query));
}

export async function getAuthorWithBooks(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await authorService.findWithBooks(id, req.user!));
}

export async function createAuthor(req: Request, res: Response) {
  const input = createAuthorSchema.parse(req.body);
  const author = await authorService.createAuthor(input, req.user!.sub);
  res.status(201).json(author);
}

export async function updateAuthor(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = updateAuthorSchema.parse(req.body);
  res.json(await authorService.updateAuthor(id, input, req.user!));
}

export async function deleteAuthor(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await authorService.deleteAuthor(id);
  res.status(204).end();
}
