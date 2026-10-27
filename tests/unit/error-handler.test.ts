import { describe, expect, it } from "vitest";
import * as z from "zod";
import { toAppError } from "../../src/middleware/error-handler";
import { AppError, NotFoundError } from "../../src/lib/errors";

describe("toAppError", () => {
  it("AppError-u olduğu kimi qaytarır", () => {
    const original = new NotFoundError("Kitab");
    expect(toAppError(original)).toBe(original);
  });

  it("ZodError-u 400 və details ilə qaytarır", () => {
    const result = z.object({ name: z.string() }).safeParse({});
    const appError = toAppError(result.error);
    expect(appError.statusCode).toBe(400);
    expect(appError.code).toBe("VALIDATION_ERROR");
    expect(appError.details).toEqual([{ field: "name", message: expect.any(String) }]);
  });

  it("Prisma P2025-i 404-ə çevirir", () => {
    const prismaError = Object.assign(new Error("not found"), { code: "P2025" });
    expect(toAppError(prismaError).statusCode).toBe(404);
  });

  it("Prisma P2002-ni 409-a çevirir", () => {
    const prismaError = Object.assign(new Error("unique"), { code: "P2002" });
    expect(toAppError(prismaError).statusCode).toBe(409);
  });

  it("malformed JSON-u 400-ə çevirir", () => {
    const parseError = Object.assign(new SyntaxError("Unexpected token"), {
      type: "entity.parse.failed",
    });
    expect(toAppError(parseError).statusCode).toBe(400);
  });

  it("naməlum xətanı 500-ə çevirir və detalı gizlədir", () => {
    const appError = toAppError(new Error("DB parolu: secret123"));
    expect(appError).toBeInstanceOf(AppError);
    expect(appError.statusCode).toBe(500);
    expect(appError.message).not.toContain("secret123");
  });
});
