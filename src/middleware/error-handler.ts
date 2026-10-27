import type { ErrorRequestHandler, RequestHandler } from "express";
import * as z from "zod";
import multer from "multer";
import { AppError, ConflictError, NotFoundError, ValidationError } from "../lib/errors";
import { isPrismaError, PrismaErrorCode } from "../lib/prisma-errors";

function isBodyParseError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type: unknown }).type === "entity.parse.failed"
  );
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof z.ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : null,
      message: issue.message,
    }));
    return new ValidationError("Sorğu məlumatları yanlışdır", details);
  }
  if (isBodyParseError(err)) return new ValidationError("JSON formatı yanlışdır");
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError("Fayl 2 MB-dan böyük ola bilməz", 413, "FILE_TOO_LARGE");
    }
    return new ValidationError(`Fayl yükləmə xətası: ${err.code}`);
  }
  if (isPrismaError(err, PrismaErrorCode.NOT_FOUND)) return new NotFoundError();
  if (isPrismaError(err, PrismaErrorCode.UNIQUE_VIOLATION)) {
    return new ConflictError("Bu dəyər artıq mövcuddur", "ALREADY_EXISTS");
  }
  if (isPrismaError(err, PrismaErrorCode.FOREIGN_KEY_VIOLATION)) {
    return new ConflictError("Əlaqəli qeyd buna imkan vermir", "RELATION_CONFLICT");
  }
  return new AppError("Internal server error", 500, "INTERNAL");
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const appError = toAppError(err);

  if (appError.statusCode >= 500) {
    console.error(`[${req.id}]`, err);
  } else {
    console.warn(`[${req.id}] ${appError.statusCode} ${appError.code}: ${appError.message}`);
  }

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      requestId: req.id,
      ...(appError.details !== undefined && { details: appError.details }),
    },
  });
};
