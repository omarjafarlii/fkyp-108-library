import { Router } from "express";
import * as controller from "../controllers/author.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/require-role.middleware";
import { Role } from "../generated/prisma/client";

const router = Router();

router.get("/", controller.listAuthors);
router.get("/:id", authMiddleware, controller.getAuthorWithBooks);
router.post("/", authMiddleware, controller.createAuthor);
router.patch("/:id", authMiddleware, controller.updateAuthor);
router.delete("/:id", authMiddleware, requireRole(Role.ADMIN), controller.deleteAuthor);

export default router;
