import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { getSettings, updateSettings } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/settings", authRequired, getSettings);
userRouter.put("/settings", authRequired, updateSettings);

