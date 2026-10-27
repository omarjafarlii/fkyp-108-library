import * as z from "zod";

export const createAuthorSchema = z.object({
  name: z
    .string({ error: "name mətn olmalıdır" })
    .trim()
    .min(2, { error: "name ən azı 2 simvol olmalıdır" })
    .max(100, { error: "name ən çox 100 simvol ola bilər" }),
  country: z
    .string({ error: "country mətn olmalıdır" })
    .trim()
    .max(60, { error: "country ən çox 60 simvol ola bilər" })
    .optional(),
});

export const updateAuthorSchema = createAuthorSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "Ən azı bir sahə göndərilməlidir",
  });

export const listAuthorsQuerySchema = z.object({
  country: z.string().trim().optional(),
  limit: z.coerce
    .number({ error: "limit rəqəm olmalıdır" })
    .int({ error: "limit tam ədəd olmalıdır" })
    .min(1, { error: "limit ən azı 1 olmalıdır" })
    .max(50, { error: "limit ən çox 50 ola bilər" })
    .default(20),
});

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
export type ListAuthorsQuery = z.infer<typeof listAuthorsQuerySchema>;
