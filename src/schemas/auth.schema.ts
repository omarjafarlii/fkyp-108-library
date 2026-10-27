import * as z from "zod";

export const registerSchema = z.object({
  email: z
    .string({ error: "email mətn olmalıdır" })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Email formatı yanlışdır" })),
  password: z
    .string({ error: "password mətn olmalıdır" })
    .min(8, { error: "Parol ən azı 8 simvol olmalıdır" })
    .refine((p) => Buffer.byteLength(p, "utf8") <= 72, {
      error: "Parol 72 baytdan uzun ola bilməz",
    }),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "email mətn olmalıdır" })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Email formatı yanlışdır" })),
  password: z.string({ error: "password mətn olmalıdır" }).min(1, { error: "Parol boş ola bilməz" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
