import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";
import "./auth.paths";
import "./book.paths";

export function generateOpenApiDocument() {
  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Kitabxana API",
      version: "1.0.0",
      description: "Kurs layihəsi: kitablar, müəlliflər, loan-lar.",
    },
  });
}
