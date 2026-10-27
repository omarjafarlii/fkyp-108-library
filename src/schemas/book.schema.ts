import * as z from "zod";

export const listBooksQuerySchema = z
  .object({
    q: z
      .string()
      .trim()
      .min(1, { error: "q boş ola bilməz" })
      .max(100)
      .optional()
      .meta({ description: "Başlıqda axtarış (böyük/kiçik hərf fərqi yoxdur)" }),
    authorId: z.coerce.number({ error: "authorId rəqəm olmalıdır" }).int().positive().optional(),
    yearFrom: z.coerce.number({ error: "yearFrom rəqəm olmalıdır" }).int().optional(),
    yearTo: z.coerce.number({ error: "yearTo rəqəm olmalıdır" }).int().optional(),
    available: z
      .stringbool({ error: "available true və ya false olmalıdır" })
      .optional()
      .meta({ description: "true — boş nüsxəsi olanlar, false — hamısı götürülənlər" }),
    sort: z.enum(["id", "title", "year"], { error: "sort yalnız id, title və ya year ola bilər" }).default("id"),
    order: z.enum(["asc", "desc"], { error: "order yalnız asc və ya desc ola bilər" }).default("asc"),
    page: z.coerce.number({ error: "page rəqəm olmalıdır" }).int().min(1, { error: "page ən azı 1 olmalıdır" }).default(1),
    limit: z.coerce
      .number({ error: "limit rəqəm olmalıdır" })
      .int()
      .min(1, { error: "limit ən azı 1 olmalıdır" })
      .max(50, { error: "limit ən çox 50 ola bilər" })
      .default(20),
  })
  .refine((d) => d.yearFrom === undefined || d.yearTo === undefined || d.yearFrom <= d.yearTo, {
    error: "yearFrom yearTo-dan böyük ola bilməz",
    path: ["yearFrom"],
  });

export const feedQuerySchema = z.object({
  q: z.string().trim().min(1, { error: "q boş ola bilməz" }).max(100).optional(),
  authorId: z.coerce.number({ error: "authorId rəqəm olmalıdır" }).int().positive().optional(),
  cursor: z.coerce.number({ error: "cursor rəqəm olmalıdır" }).int().positive().optional(),
  limit: z.coerce
    .number({ error: "limit rəqəm olmalıdır" })
    .int()
    .min(1, { error: "limit ən azı 1 olmalıdır" })
    .max(50, { error: "limit ən çox 50 ola bilər" })
    .default(20),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
