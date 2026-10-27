export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Sorğu məlumatları yanlışdır", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Autentifikasiya tələb olunur") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bu əməliyyata icazəniz yoxdur") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resurs") {
    super(`${resource} tapılmadı`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Konflikt", code = "CONFLICT") {
    super(message, 409, code);
  }
}
