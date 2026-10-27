import { Router } from "express";
import * as controller from "../controllers/loan.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/:id/return", controller.returnLoan);

export default router;
