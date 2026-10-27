import * as z from "zod";

export const profileSchema = z.object({
  displayName: z
    .string({ error: "displayName mətn olmalıdır" })
    .trim()
    .min(2, { error: "displayName ən azı 2 simvol olmalıdır" })
    .max(50, { error: "displayName ən çox 50 simvol ola bilər" }),
  bio: z
    .string({ error: "bio mətn olmalıdır" })
    .trim()
    .max(300, { error: "bio ən çox 300 simvol ola bilər" })
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
