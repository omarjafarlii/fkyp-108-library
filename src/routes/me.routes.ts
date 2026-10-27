import { Router } from "express";
import * as controller from "../controllers/me.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const meRouter = Router();
meRouter.use(authMiddleware);

meRouter.get("/", controller.getMe);
meRouter.put("/profile", controller.putProfile);

export default meRouter;
