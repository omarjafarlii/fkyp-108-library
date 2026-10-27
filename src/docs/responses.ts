import type * as z from "zod";
import { ErrorResponseSchema } from "./schemas";

// JSON cavabı üçün qısa yol: { description, content: { "application/json": { schema } } }
export function jsonResponse(description: string, schema: z.ZodType) {
  return { description, content: { "application/json": { schema } } };
}

export function errorResponse(description: string) {
  return jsonResponse(description, ErrorResponseSchema);
}
