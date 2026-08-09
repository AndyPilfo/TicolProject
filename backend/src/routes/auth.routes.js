import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { changePassword, login, logout, me, register } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authRequired, logout);
authRouter.get("/me", authRequired, me);
authRouter.put("/password", authRequired, changePassword);
