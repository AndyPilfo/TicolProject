import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { changePassword, login, logout, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/logout", authRequired, asyncHandler(logout));
authRouter.get("/me", authRequired, asyncHandler(me));
authRouter.put("/password", authRequired, asyncHandler(changePassword));
