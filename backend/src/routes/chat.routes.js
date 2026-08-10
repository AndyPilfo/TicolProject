import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authRequired } from "../middleware/authRequired.js";
import { getChatConfig, sendChatMessage } from "../controllers/chat.controller.js";
import { conversationsRouter } from "./conversations.routes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatRouter = Router();
const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

chatRouter.use(authRequired);
chatRouter.use("/conversations", conversationsRouter);
chatRouter.get("/config", asyncHandler(getChatConfig));
chatRouter.post("/", chatMessageLimiter, asyncHandler(sendChatMessage));
