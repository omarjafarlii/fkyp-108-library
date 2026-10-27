import { registry } from "./registry";
import { LoginResponseSchema, PublicUserSchema } from "./schemas";
import { errorResponse, jsonResponse } from "./responses";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Qeydiyyat",
  request: {
    body: { required: true, content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    201: jsonResponse("İstifadəçi yaradıldı", PublicUserSchema),
    400: errorResponse("Body yanlışdır"),
    409: errorResponse("Bu email artıq qeydiyyatdan keçib (EMAIL_TAKEN)"),
    429: errorResponse("Çox qeydiyyat cəhdi — bir az gözləyin"),
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Giriş — JWT token alır",
  request: {
    body: { required: true, content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: jsonResponse("Uğurlu giriş", LoginResponseSchema),
    400: errorResponse("Body yanlışdır"),
    401: errorResponse("Email və ya parol yanlışdır"),
    429: errorResponse("Çox cəhd — bir az gözləyin"),
  },
});
