import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { HttpError } from "../utils/httpError.js";

function toSummary(conv) {
  const lastMessage = conv.messages?.[conv.messages.length - 1];
  const firstUserMessage = conv.messages?.find((message) => message.role === "user");

  return {
    id: conv._id.toString(),
    title: conv.title || String(firstUserMessage?.content || "Conversación").slice(0, 80),
    messageCount: conv.messages?.length ?? 0,
    lastMessageAt: lastMessage?.createdAt ?? conv.updatedAt ?? conv.createdAt,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  };
}

function toDto(conv) {
  return {
    id: conv._id.toString(),
    title: conv.title,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    messages: (conv.messages ?? []).map((message) => ({
      id: message._id?.toString?.(),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      sourceArticles: message.sourceArticles ?? []
    }))
  };
}

export async function listConversations(req, res) {
  const conversations = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(50).lean();
  return res.json({ conversations: conversations.map(toSummary) });
}

export async function createConversation(req, res) {
  const conversation = await Conversation.create({ userId: req.user.id, messages: [] });
  return res.status(201).json({ conversation: toDto(conversation) });
}

export async function getConversation(req, res) {
  const { conversationId } = req.params;
  if (!mongoose.isValidObjectId(conversationId)) throw new HttpError(400, "ID de conversación inválido.");

  const conversation = await Conversation.findOne({ _id: conversationId, userId: req.user.id }).lean();
  if (!conversation) throw new HttpError(404, "Conversación no encontrada.");

  return res.json({ conversation: toDto(conversation) });
}

export async function addConversationMessage(req, res) {
  const { conversationId } = req.params;
  if (!mongoose.isValidObjectId(conversationId)) throw new HttpError(400, "ID de conversación inválido.");

  const { role, content, sourceArticles = [] } = req.body ?? {};
  if (!["user", "assistant", "system"].includes(role) || typeof content !== "string" || !content.trim()) {
    throw new HttpError(400, "Datos inválidos.");
  }

  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, userId: req.user.id },
    { $push: { messages: { role, content: content.trim(), sourceArticles } } },
    { new: true }
  );

  if (!conversation) throw new HttpError(404, "Conversación no encontrada.");
  return res.status(201).json({ conversation: toDto(conversation) });
}

export async function deleteConversation(req, res) {
  const { conversationId } = req.params;
  if (!mongoose.isValidObjectId(conversationId)) throw new HttpError(400, "ID de conversación inválido.");

  const deleted = await Conversation.findOneAndDelete({ _id: conversationId, userId: req.user.id });
  if (!deleted) throw new HttpError(404, "Conversación no encontrada.");

  return res.json({ ok: true });
}
