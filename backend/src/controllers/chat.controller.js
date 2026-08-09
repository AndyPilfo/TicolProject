import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import { buildChatConfig, handleChatMessage } from "../services/chat.service.js";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
  articleId: z.string().regex(/^(?:[1-9]\d{0,2}|[a-fA-F0-9]{24})$/).optional(),
  locale: z.enum(["es", "en"]).default("es")
});

export async function sendChatMessage(req, res) {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inválidos.", parsed.error.flatten());

  const result = await handleChatMessage({
    userId: req.user.id,
    ...parsed.data
  });

  return res.status(201).json({
    provider: buildChatConfig(parsed.data.locale),
    providerState: result.providerState,
    conversation: {
      id: result.conversation._id.toString(),
      title: result.conversation.title,
      createdAt: result.conversation.createdAt,
      updatedAt: result.conversation.updatedAt,
      messages: result.conversation.messages.map((message) => ({
        id: message._id?.toString?.(),
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        sourceArticles: message.sourceArticles ?? []
      }))
    },
    assistantMessage: {
      role: "assistant",
      content: result.assistantMessage.content,
      sourceArticles: result.assistantMessage.sourceArticles ?? []
    },
    contextArticles: result.contextArticles
  });
}

export async function getChatConfig(req, res) {
  const locale = typeof req.query?.locale === "string" && req.query.locale === "en" ? "en" : "es";
  return res.json({ config: buildChatConfig(locale) });
}
