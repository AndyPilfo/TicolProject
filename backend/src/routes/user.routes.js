import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { getSettings, updateSettings } from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter = Router();

userRouter.get("/settings", authRequired, asyncHandler(getSettings));
userRouter.put("/settings", authRequired, asyncHandler(updateSettings));
