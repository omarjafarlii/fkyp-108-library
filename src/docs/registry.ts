import * as z from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

// Zod-a .openapi() metodunu əlavə edir. registry.register() içəridə bunu çağırır.
// Bu sətir hər şeydən əvvəl işləməlidir — ona görə registry ilə eyni fayldadır.
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "POST /auth/login cavabındakı token",
});
