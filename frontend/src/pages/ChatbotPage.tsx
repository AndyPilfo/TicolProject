import { BookOpen, MessageSquareText, ShieldAlert, Sparkles } from "lucide-react";
import { useI18n } from "../state/i18n";
import { useAuth } from "../state/auth";
import { useUi } from "../state/ui";

export function ChatbotPage() {
  const { token } = useAuth();
  const { openAuthModal, openChatWidget } = useUi();
  const { t } = useI18n();

  function handleOpenAssistant() {
    if (!token) {
      openAuthModal({ reason: t("auth.reasonDefault"), returnTo: "/chatbot" });
      return;
    }

    openChatWidget();
  }

  const examples = [t("chat.example1"), t("chat.example2"), t("chat.example3")];

  return (
    <div className="ticol-container py-6 sm:py-8">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr] 2xl:grid-cols-[1.2fr_1fr] 2xl:gap-6 2xl:min-h-[calc(100vh-16rem)]">
        <section className="space-y-4 h-full">
          <div className="card h-full overflow-hidden p-0">
            <div className="bg-gradient-to-r from-brandBlue via-[#3d72f7] to-brandOrange px-6 py-5 text-white 2xl:px-8 2xl:py-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{t("chat.chatTitle")}</h1>
                  <p className="mt-1 text-sm text-white/85">{t("chat.pageLead")}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 2xl:gap-5 2xl:p-8">
              <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brandBlue/10 text-brandBlue dark:bg-brandOrange/10 dark:text-brandOrange">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold">{t("chat.whatItDoesTitle")}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/70 dark:text-white/70">
                  {t("chat.whatItDoesText")}
                </p>
              </article>

              <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brandBlue/10 text-brandBlue dark:bg-brandOrange/10 dark:text-brandOrange">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold">{t("chat.howItRespondsTitle")}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/70 dark:text-white/70">
                  {t("chat.howItRespondsText")}
                </p>
              </article>

              <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brandBlue/10 text-brandBlue dark:bg-brandOrange/10 dark:text-brandOrange">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold">{t("chat.limitationsTitle")}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/70 dark:text-white/70">
                  {t("chat.limitationsText")}
                </p>
              </article>

              <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brandBlue/10 text-brandBlue dark:bg-brandOrange/10 dark:text-brandOrange">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold">{t("chat.examplesTitle")}</h2>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-black/70 dark:text-white/70">
                  {examples.map((example) => (
                    <li key={example} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandOrange" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <aside className="space-y-4 h-full">
          <div className="card p-6 2xl:p-8">
            <h2 className="text-sm font-semibold">{t("chat.openAssistant")}</h2>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              {t("chat.openAssistantText")}
            </p>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brandOrange px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#e66c01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brandOrange/35"
              onClick={handleOpenAssistant}
            >
              <MessageSquareText className="h-4 w-4" />
              {t("chat.openAssistantButton")}
            </button>
          </div>

          <div className="card p-6 2xl:p-8">
            <h2 className="text-sm font-semibold">{t("chat.whatYouCanAskTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              {t("chat.whatYouCanAskText")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
