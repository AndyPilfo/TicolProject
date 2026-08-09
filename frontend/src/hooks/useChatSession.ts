import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../state/auth";
import { useI18n } from "../state/i18n";
import type { Article, ChatConfig, ConversationDto, ConversationMessage, ConversationSummary } from "../types";

export function useChatSession() {
  const { token, ready } = useAuth();
  const { language, t } = useI18n();
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [contextArticles, setContextArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyBootstrappedRef = useRef(false);

  useEffect(() => {
    historyBootstrappedRef.current = false;
  }, [token]);

  const loadConfig = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getChatConfig(language);
      setConfig(response.config);
    } catch {
      setConfig(null);
    }
  }, [language, token]);

  const hydrateConversation = useCallback((conversation: ConversationDto) => {
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    const lastAssistantMessage = [...conversation.messages].reverse().find((message) => message.role === "assistant");
    setContextArticles(lastAssistantMessage?.sourceArticles ?? []);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!token) {
      setConversations([]);
      setConversationId(null);
      setMessages([]);
      setContextArticles([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await api.listConversations();
      setConversations(response.conversations);

      if (!historyBootstrappedRef.current && !conversationId && response.conversations.length > 0) {
        const latest = response.conversations[0];
        const detail = await api.getConversation(latest.id);
        hydrateConversation(detail.conversation);
      }

      historyBootstrappedRef.current = true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("chat.error"));
    } finally {
      setHistoryLoading(false);
    }
  }, [conversationId, hydrateConversation, t, token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setConfig(null);
      setConversations([]);
      setConversationId(null);
      setMessages([]);
      setContextArticles([]);
      return;
    }

    void loadConfig();
    void loadConversations();
  }, [language, loadConfig, loadConversations, ready, token]);

  const sendMessage = useCallback(
    async (message: string, articleId?: string) => {
      if (!token) {
        throw new Error("Debes iniciar sesión para usar el chat.");
      }

      setSending(true);
      setLoading(true);
      setError(null);
      try {
        const response = await api.sendChatMessage({
          message,
          articleId,
          conversationId: conversationId ?? undefined,
          locale: language
        });

        hydrateConversation(response.conversation);
        setContextArticles(response.contextArticles);
        setConfig(response.provider);
        setConversations((current) => {
          const next = current.filter((item) => item.id !== response.conversation.id);
          next.unshift({
            id: response.conversation.id,
            title: response.conversation.title || message.slice(0, 80),
            messageCount: response.conversation.messages.length,
            lastMessageAt: response.conversation.updatedAt,
            createdAt: response.conversation.createdAt,
            updatedAt: response.conversation.updatedAt
          });
          return next;
        });

        return response;
      } catch (nextError) {
        const messageText = nextError instanceof Error ? nextError.message : t("chat.error");
        setError(messageText);
        throw nextError;
      } finally {
        setSending(false);
        setLoading(false);
      }
    },
    [conversationId, hydrateConversation, language, t, token]
  );

  const selectConversation = useCallback(
    async (nextConversationId: string) => {
      if (!token) return;
      setHistoryLoading(true);
      setError(null);
      try {
        const response = await api.getConversation(nextConversationId);
        hydrateConversation(response.conversation);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : t("chat.error"));
      } finally {
        setHistoryLoading(false);
      }
    },
    [hydrateConversation, t, token]
  );

  const startNewConversation = useCallback(async () => {
    if (!token) return null;
    const response = await api.createConversation();
    hydrateConversation(response.conversation);
    setContextArticles([]);
    setError(null);
    setConversations((current) => [summaryFromConversation(response.conversation), ...current]);
    return response.conversation.id;
  }, [hydrateConversation, token]);

  const clearActiveConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setContextArticles([]);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    async (targetConversationId: string) => {
      if (!token) return;

      await api.deleteConversation(targetConversationId);
      const wasActiveConversation = conversationId === targetConversationId;
      let nextActiveConversationId: string | null = null;

      setConversations((current) => {
        const next = current.filter((conversation) => conversation.id !== targetConversationId);
        nextActiveConversationId = next[0]?.id ?? null;
        return next;
      });

      if (wasActiveConversation) {
        if (nextActiveConversationId) {
          await selectConversation(nextActiveConversationId);
        } else {
          clearActiveConversation();
        }
      }
    },
    [clearActiveConversation, conversationId, selectConversation, token]
  );

  const currentConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === conversationId) ?? null;
  }, [conversationId, conversations]);

  return {
    config,
    conversations,
    conversationId,
    currentConversation,
    messages,
    contextArticles,
    loading,
    historyLoading,
    sending,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
    clearActiveConversation,
    reloadHistory: loadConversations
  };
}

function summaryFromConversation(conversation: ConversationDto): ConversationSummary {
  return {
    id: conversation.id,
    title: conversation.title || "Nueva conversación",
    messageCount: conversation.messages.length,
    lastMessageAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}
