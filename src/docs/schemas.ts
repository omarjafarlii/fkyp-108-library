import * as z from "zod";
import { registry } from "./registry";

export const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.strictObject({
    error: z.strictObject({
      code: z.string().meta({ example: "VALIDATION_ERROR" }),
      message: z.string().meta({ example: "Sorğu məlumatları yanlışdır" }),
      requestId: z.string().meta({ example: "9b2f6c1e-3d4a-4f5b-8c7d-1e2f3a4b5c6d" }),
      details: z
        .array(z.strictObject({ field: z.string().nullable(), message: z.string() }))
        .optional(),
    }),
  }),
);

export const BookSchema = registry.register(
  "Book",
  z.strictObject({
    id: z.number().int().meta({ example: 1 }),
    title: z.string().meta({ example: "Əli və Nino" }),
    year: z.number().int().meta({ example: 1937 }),
    availableCopies: z.number().int().meta({ example: 3 }),
    author: z.strictObject({
      id: z.number().int().meta({ example: 1 }),
      name: z.string().meta({ example: "Qurban Səid" }),
    }),
  }),
);

export const BookListSchema = registry.register(
  "BookList",
  z.strictObject({
    data: z.array(BookSchema),
    meta: z.strictObject({
      page: z.number().int().meta({ example: 1 }),
      limit: z.number().int().meta({ example: 20 }),
      total: z.number().int().meta({ example: 41 }),
      totalPages: z.number().int().meta({ example: 3 }),
    }),
  }),
);

export const BookStatusSchema = registry.register(
  "BookStatus",
  z.strictObject({
    id: z.number().int().meta({ example: 1 }),
    title: z.string().meta({ example: "Əli və Nino" }),
    availableCopies: z.number().int().meta({ example: 2 }),
    _count: z.strictObject({ loans: z.number().int().meta({ example: 1 }) }),
  }),
);

export const LoanSchema = registry.register(
  "Loan",
  z.strictObject({
    id: z.number().int().meta({ example: 10 }),
    bookId: z.number().int().meta({ example: 1 }),
    borrowedAt: z.iso.datetime().meta({ example: "2026-10-22T09:30:00.000Z" }),
  }),
);

export const PublicUserSchema = registry.register(
  "PublicUser",
  z.strictObject({
    id: z.number().int().meta({ example: 7 }),
    email: z.email().meta({ example: "aysel@example.com" }),
    createdAt: z.iso.datetime().meta({ example: "2026-10-01T12:00:00.000Z" }),
  }),
);

export const LoginResponseSchema = registry.register(
  "LoginResponse",
  z.strictObject({
    user: PublicUserSchema,
    token: z.string().meta({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  }),
);

export const BookFeedSchema = registry.register(
  "BookFeed",
  z.strictObject({
    data: z.array(BookSchema),
    nextCursor: z.number().int().nullable().meta({ example: 21 }),
  }),
);
