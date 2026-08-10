import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import {
  addConversationMessage,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations
} from "../controllers/conversations.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const conversationsRouter = Router();

conversationsRouter.use(authRequired);

conversationsRouter.get("/", asyncHandler(listConversations));
conversationsRouter.post("/", asyncHandler(createConversation));
conversationsRouter.get("/:conversationId", asyncHandler(getConversation));
conversationsRouter.post("/:conversationId/messages", asyncHandler(addConversationMessage));
conversationsRouter.delete("/:conversationId", asyncHandler(deleteConversation));
