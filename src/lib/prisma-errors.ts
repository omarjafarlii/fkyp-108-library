export const PrismaErrorCode = {
  NOT_FOUND: "P2025",
  UNIQUE_VIOLATION: "P2002",
  FOREIGN_KEY_VIOLATION: "P2003",
} as const;

export type PrismaErrorCodeValue =
  (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export function isPrismaError(
  error: unknown,
  code: PrismaErrorCodeValue,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  );
}
