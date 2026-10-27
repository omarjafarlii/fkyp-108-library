import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { loginLimiter, registerLimiter } from "../middleware/rate-limit";

const router = Router();

router.post("/register", registerLimiter, controller.register);
router.post("/login", loginLimiter, controller.login);

export default router;
