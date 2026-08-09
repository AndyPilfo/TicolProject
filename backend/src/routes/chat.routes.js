import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authRequired } from "../middleware/authRequired.js";
import { getChatConfig, sendChatMessage } from "../controllers/chat.controller.js";
import { conversationsRouter } from "./conversations.routes.js";

export const chatRouter = Router();
const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

chatRouter.use(authRequired);
chatRouter.use("/conversations", conversationsRouter);
chatRouter.get("/config", getChatConfig);
chatRouter.post("/", chatMessageLimiter, sendChatMessage);
