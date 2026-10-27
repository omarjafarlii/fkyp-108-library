import { registry, bearerAuth } from "./registry";
import { BookFeedSchema, BookListSchema, BookStatusSchema, LoanSchema } from "./schemas";
import { errorResponse, jsonResponse } from "./responses";
import { feedQuerySchema, listBooksQuerySchema } from "../schemas/book.schema";
import { idParamSchema } from "../schemas/common.schema";

registry.registerPath({
  method: "get",
  path: "/books",
  tags: ["Books"],
  summary: "Kitab siyahısı (filter, sort, pagination)",
  request: { query: listBooksQuerySchema },
  responses: {
    200: jsonResponse("Kitablar və pagination məlumatı", BookListSchema),
    400: errorResponse("Query parametri yanlışdır"),
  },
});

registry.registerPath({
  method: "get",
  path: "/books/feed",
  tags: ["Books"],
  summary: "Sonsuz lent (cursor pagination)",
  request: { query: feedQuerySchema },
  responses: {
    200: jsonResponse("Kitablar və növbəti səhifənin cursor-u", BookFeedSchema),
    400: errorResponse("Query parametri yanlışdır"),
  },
});

registry.registerPath({
  method: "get",
  path: "/books/{id}",
  tags: ["Books"],
  summary: "Bir kitabın vəziyyəti",
  request: { params: idParamSchema },
  responses: {
    200: jsonResponse("Kitab və aktiv loan sayı", BookStatusSchema),
    400: errorResponse("id rəqəm deyil"),
    404: errorResponse("Kitab tapılmadı"),
  },
});

registry.registerPath({
  method: "post",
  path: "/books/{id}/borrow",
  tags: ["Books"],
  summary: "Kitabı götür",
  security: [{ [bearerAuth.name]: [] }],
  request: { params: idParamSchema },
  responses: {
    201: jsonResponse("Loan yaradıldı", LoanSchema),
    401: errorResponse("Token yoxdur və ya yanlışdır"),
    404: errorResponse("Kitab tapılmadı"),
    409: errorResponse("Boş nüsxə qalmayıb (NO_COPIES_LEFT)"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/books/{id}/cover",
  tags: ["Books"],
  summary: "Üz qabığını sil",
  security: [{ [bearerAuth.name]: [] }],
  request: { params: idParamSchema },
  responses: {
    204: { description: "Silindi — cavabda body yoxdur" },
    401: errorResponse("Token yoxdur və ya yanlışdır"),
    404: errorResponse("Kitab sizin deyil, yoxdur və ya üz qabığı yoxdur"),
  },
});
