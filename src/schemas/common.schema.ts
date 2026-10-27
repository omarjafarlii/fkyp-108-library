import * as z from "zod";

export const idParamSchema = z.object({
  id: z.coerce
    .number({ error: "id rəqəm olmalıdır" })
    .int({ error: "id tam ədəd olmalıdır" })
    .positive({ error: "id müsbət olmalıdır" }),
});
