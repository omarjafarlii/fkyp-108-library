import { Router } from "express";
import * as controller from "../controllers/book.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { coverUpload } from "../lib/upload";

const router = Router();

router.get("/", controller.listBooks);
router.get("/feed", controller.feed);
router.get("/:id", controller.getBook);
router.post("/:id/borrow", authMiddleware, controller.borrow);
router.post("/:id/cover", authMiddleware, coverUpload.single("cover"), controller.uploadCover);
router.delete("/:id/cover", authMiddleware, controller.deleteCover);

export default router;
