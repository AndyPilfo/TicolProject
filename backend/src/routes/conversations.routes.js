import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import {
  addConversationMessage,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations
} from "../controllers/conversations.controller.js";

export const conversationsRouter = Router();

conversationsRouter.use(authRequired);

conversationsRouter.get("/", listConversations);
conversationsRouter.post("/", createConversation);
conversationsRouter.get("/:conversationId", getConversation);
conversationsRouter.post("/:conversationId/messages", addConversationMessage);
conversationsRouter.delete("/:conversationId", deleteConversation);
