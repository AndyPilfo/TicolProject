import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import {
  ChevronRight,
  LoaderCircle,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { useChatSession } from "../../hooks/useChatSession";
import { useAuth } from "../../state/auth";
import { useI18n } from "../../state/i18n";
import { useUi } from "../../state/ui";
import { clsx } from "../../utils/clsx";
import { ConfirmModal } from "../ConfirmModal";

type ChatPanelProps = {
  onClose?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement>;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ChatPanel({ onClose, closeButtonRef }: ChatPanelProps) {
  const { token } = useAuth();
  const { openAuthModal } = useUi();
  const { t } = useI18n();
  const {
    conversations,
    conversationId,
    currentConversation,
    messages,
    historyLoading,
    sending,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
    reloadHistory
  } = useChatSession();

  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [desktopHistoryCollapsed, setDesktopHistoryCollapsed] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [pendingDeleteConversation, setPendingDeleteConversation] = useState<{ id: string; title: string } | null>(
    null
  );
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  useEffect(() => {
    if (validationError && draft.trim()) {
      setValidationError(null);
    }
  }, [draft, validationError]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [conversationId]);

  const selectedConversationTitle = useMemo(() => {
    return currentConversation?.title?.trim() || t("chat.selectedConversationFallback");
  }, [currentConversation?.title, t]);

  const sourceArticlesLabel = useMemo(
    () => (articles: { articleNumber: number }[]) => {
      if (!articles.length) return "";
      const numbers = articles.map((article) => article.articleNumber);
      const lastNumber = numbers[numbers.length - 1];
      const list =
        numbers.length === 1
          ? String(numbers[0])
          : numbers.length === 2
            ? numbers.join(" y ")
            : `${numbers.slice(0, -1).join(", ")} y ${lastNumber}`;
      return t("chat.articleSources", { articles: list });
    },
    [t]
  );

  async function submitMessage() {
    if (sending) return;

    const message = draft.trim();
    if (!message) {
      setValidationError(t("chat.messageRequired"));
      inputRef.current?.focus();
      return;
    }

    if (!token) {
      openAuthModal({ reason: t("auth.reasonDefault"), returnTo: "/chatbot" });
      return;
    }

    setValidationError(null);

    try {
      await sendMessage(message);
      setDraft("");
      window.requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    } catch {
      // El estado de error ya lo muestra el hook.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage();
  }

  async function handleNewConversation() {
    if (!token) {
      openAuthModal({ reason: t("auth.reasonDefault"), returnTo: "/chatbot" });
      return;
    }

    await startNewConversation();
    setDraft("");
    setValidationError(null);
    setMobileHistoryOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }

  async function handleSelectConversation(nextConversationId: string) {
    await selectConversation(nextConversationId);
    setMobileHistoryOpen(false);
  }

  function requestDeleteConversation(nextConversationId: string, title: string) {
    setPendingDeleteConversation({ id: nextConversationId, title });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  }

  function renderHistoryPanel(compact: boolean, mobile = false) {
    const showCompact = compact && !mobile;

    return (
      <div
        className={clsx(
          "flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-200 bg-black/5 shadow-sm transition-[width,opacity,transform] duration-300 ease-out dark:border-blue-900/70 dark:bg-white/5",
          showCompact ? "lg:w-[92px]" : "lg:w-[240px]",
          mobile && "w-full"
        )}
      >
        <div
          className={clsx(
            "border-b border-blue-200 dark:border-blue-900/70",
            showCompact ? "px-2 py-3" : "px-4 py-3"
          )}
        >
          {showCompact ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brandBlue text-white shadow-sm transition hover:bg-[#0a57c3] focus:outline-none focus:ring-2 focus:ring-brandOrange/30"
                onClick={() => setDesktopHistoryCollapsed(false)}
                aria-label={t("chat.expandHistory")}
                title={t("chat.expandHistory")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brandOrange text-white shadow-sm transition hover:bg-[#e66c01] focus:outline-none focus:ring-2 focus:ring-brandOrange/35"
                onClick={() => void handleNewConversation()}
                aria-label={t("chat.newConversation")}
                title={t("chat.newConversation")}
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                  {t("chat.sessions")}
                </div>
                <div className="mt-1 truncate text-sm font-bold text-black/75 dark:text-white/80">
                  {selectedConversationTitle}
                </div>
              </div>

              {!mobile && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black/65 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-brandOrange/30 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                    onClick={() => setDesktopHistoryCollapsed((current) => !current)}
                    aria-label={t("chat.collapseHistory")}
                    title={t("chat.collapseHistory")}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brandOrange text-white shadow-sm transition hover:bg-[#e66c01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brandOrange/35"
                    onClick={() => void handleNewConversation()}
                    aria-label={t("chat.newConversation")}
                    title={t("chat.newConversation")}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className={clsx("space-y-2", showCompact && "space-y-3")}>
            {historyLoading ? (
              showCompact ? (
                <div className="grid place-items-center rounded-2xl border border-dashed border-blue-200 px-2 py-4 text-center text-xs text-black/55 dark:border-blue-900/70 dark:text-white/55">
                  <LoaderCircle className="h-5 w-5 animate-spin text-brandOrange" />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 px-3 py-4 text-sm text-black/55 dark:border-blue-900/70 dark:text-white/55">
                  {t("chat.loadingConversations")}
                </div>
              )
            ) : conversations.length === 0 ? (
              showCompact ? (
                <div className="grid place-items-center rounded-2xl border border-dashed border-blue-200 px-2 py-4 text-center text-xs text-black/55 dark:border-blue-900/70 dark:text-white/55">
                  <MessageSquare className="h-5 w-5 text-brandOrange" />
                  <span className="sr-only">{t("chat.noSavedConversations")}</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 px-3 py-4 text-sm text-black/55 dark:border-blue-900/70 dark:text-white/55">
                  {t("chat.noSavedConversations")}
                </div>
              )
            ) : (
              conversations.map((conversation) => {
                const selected = conversation.id === conversationId;

                if (showCompact) {
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={clsx(
                        "grid h-11 w-11 place-items-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-brandOrange/30",
                        selected
                          ? "border-brandBlue/40 bg-brandBlue/10 text-brandBlue dark:border-brandBlue/70 dark:bg-brandBlue/15 dark:text-white"
                          : "border-black/5 bg-white/80 text-black/70 hover:bg-black/5 dark:border-white/10 dark:bg-[#242323] dark:text-white/75 dark:hover:bg-white/10"
                      )}
                      onClick={() => void handleSelectConversation(conversation.id)}
                      aria-current={selected ? "true" : undefined}
                      aria-label={conversation.title}
                      title={conversation.title}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  );
                }

                return (
                  <div
                    key={conversation.id}
                    className={clsx(
                      "rounded-2xl border p-2 transition",
                      selected
                        ? "border-brandBlue/40 bg-brandBlue/10 dark:border-brandBlue/70 dark:bg-brandBlue/15"
                        : "border-black/5 bg-white/80 dark:border-white/10 dark:bg-[#242323]"
                    )}
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl px-2 py-2 text-left outline-none transition focus:ring-2 focus:ring-brandOrange/30"
                      onClick={() => void handleSelectConversation(conversation.id)}
                      aria-current={selected ? "true" : undefined}
                    >
                      <div className="truncate text-sm font-semibold text-black/80 dark:text-white/85">
                        {conversation.title}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-black/45 dark:text-white/55">
                        <span>
                          {conversation.messageCount} {t("chat.messagesLabel")}
                        </span>
                        <span>{formatMessageTime(conversation.updatedAt)}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:text-brandOrange dark:hover:bg-brandOrange/10"
                      onClick={() => requestDeleteConversation(conversation.id, conversation.title)}
                      aria-label={`${t("chat.deleteConversation")} ${conversation.title}`}
                      title={t("chat.deleteConversation")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("common.remove")}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            className={clsx(
              "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brandOrange/30 dark:border-blue-900/70 dark:bg-[#242323] dark:text-white/80 dark:hover:bg-white/10",
              showCompact && "px-0 text-xs"
            )}
            onClick={() => void reloadHistory()}
            aria-label={t("chat.reloadConversations")}
            title={t("chat.reloadConversations")}
          >
            <RefreshCw className="h-4 w-4" />
            {!showCompact && t("chat.reloadConversations")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-soft dark:border-blue-900/70 dark:bg-[#1f1e1e]">
      <header className="flex items-center justify-between gap-3 bg-brandBlue px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/15">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{t("chat.chatTitle")}</div>
            <div className="truncate text-xs text-white/80">{t("chat.assistantTitle")}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 lg:hidden"
            onClick={() => setMobileHistoryOpen((current) => !current)}
            aria-label={mobileHistoryOpen ? t("chat.closeSessions") : t("chat.openSessions")}
            title={mobileHistoryOpen ? t("chat.closeSessions") : t("chat.openSessions")}
          >
            <Menu className="h-4 w-4" />
          </button>

          {onClose && (
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              onClick={onClose}
              aria-label={t("chat.closeAssistant")}
              title={t("chat.closeAssistant")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div
        className={clsx(
          "relative grid min-h-0 flex-1 gap-4 p-4 transition-[grid-template-columns] duration-300 ease-out",
          desktopHistoryCollapsed
            ? "lg:grid-cols-[92px_minmax(0,1fr)]"
            : "lg:grid-cols-[240px_minmax(0,1fr)]"
        )}
      >
        <aside className="hidden min-h-0 flex-col overflow-hidden lg:flex">{renderHistoryPanel(desktopHistoryCollapsed)}</aside>

        <section className="relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-200 bg-[#f8fafc] dark:border-blue-900/70 dark:bg-[#242323]">
          <div className="flex items-center justify-between gap-2 border-b border-blue-200 px-4 py-3 lg:hidden dark:border-blue-900/70">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 shadow-sm dark:border-white/10 dark:bg-[#1f1e1e] dark:text-white/75"
              onClick={() => setMobileHistoryOpen(true)}
            >
              <Menu className="h-3.5 w-3.5" />
              {t("chat.sessions")}
            </button>

            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brandOrange px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e66c01] hover:shadow-md"
              onClick={() => void handleNewConversation()}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {t("chat.newConversationMobile")}
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.length === 0 && !sending ? (
                <div className="grid min-h-[240px] place-items-center rounded-3xl border border-dashed border-blue-200 bg-white/80 px-6 py-8 text-center dark:border-blue-900/70 dark:bg-white/5">
                  <div>
                    <Sparkles className="mx-auto h-8 w-8 text-brandOrange" />
                    <p className="mt-3 max-w-xs text-sm font-semibold text-black/65 dark:text-white/70">
                      {t("chat.greeting")}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "user";
                  const sourceLabel = sourceArticlesLabel(message.sourceArticles ?? []);

                  return (
                    <div
                      key={message.id || `${message.role}-${message.createdAt}`}
                      className={clsx(
                        "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                        isUser
                          ? "ml-auto bg-brandBlue text-white"
                          : "bg-white text-black dark:bg-[#1f1e1e] dark:text-white"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] opacity-80">
                        <span>{formatMessageTime(message.createdAt)}</span>
                        <span>{isUser ? t("chat.userLabel") : t("chat.assistantLabel")}</span>
                      </div>

                      {!isUser && sourceLabel && (
                        <div className="mt-2 rounded-2xl bg-brandBlue/5 px-3 py-2 text-xs text-black/70 dark:bg-white/5 dark:text-white/70">
                          {sourceLabel}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="max-w-[88%] rounded-3xl bg-white px-4 py-3 text-sm text-black shadow-sm dark:bg-[#1f1e1e] dark:text-white">
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin text-brandOrange" />
                    {t("chat.writingResponse")}
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            className="shrink-0 border-t border-blue-200 bg-white/95 px-4 py-3 dark:border-blue-900/70 dark:bg-[#1f1e1e]/95"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="chat-draft">
              {t("chat.messageLabel")}
            </label>

            <div className="flex items-end gap-3">
              <textarea
                id="chat-draft"
                ref={inputRef}
                className="input min-h-[56px] flex-1 resize-none rounded-2xl py-3"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={t("chat.messagePlaceholder")}
                aria-label={t("chat.messageLabel")}
                rows={2}
              />

              <button
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brandOrange text-white shadow-sm transition hover:bg-[#e66c01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brandOrange/35 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={sending || !draft.trim()}
                aria-label={t("common.send")}
                title={t("common.send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {validationError && <div className="mt-2 text-sm text-red-600 dark:text-red-300">{validationError}</div>}
          </form>

          {mobileHistoryOpen && (
            <div className="absolute inset-0 z-20 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-transparent backdrop-blur-sm"
                onClick={() => setMobileHistoryOpen(false)}
                aria-label={t("chat.closeSessions")}
              />
              <div className="relative ml-auto h-full w-[92%] max-w-sm p-3">
                <div
                  className="h-full overflow-hidden rounded-[28px] shadow-soft"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {renderHistoryPanel(false, true)}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(pendingDeleteConversation)}
        title={t("chat.deleteConversationTitle")}
        description={
          pendingDeleteConversation
            ? t("chat.deleteConversationDescription", { title: pendingDeleteConversation.title })
            : t("chat.deleteConversationSelectionDescription")
        }
        confirmLabel={t("chat.deleteConversation")}
        cancelLabel={t("common.cancel")}
        confirmButtonClassName="btn-orange"
        busy={false}
        onCancel={() => setPendingDeleteConversation(null)}
        onConfirm={async () => {
          if (!pendingDeleteConversation) return;
          await deleteConversation(pendingDeleteConversation.id);
          setPendingDeleteConversation(null);
        }}
      />
    </div>
  );
}
