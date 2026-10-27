import { Router } from "express";
import { adminOnly } from "../middleware/stacks";

const adminRouter = Router();
adminRouter.use(adminOnly);

adminRouter.get("/stats", (_req, res) => {
  res.json({ users: 42 });
});

export default adminRouter;
