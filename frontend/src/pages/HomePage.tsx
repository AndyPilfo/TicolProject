import { ArrowRight, Heart, MessageSquare, Search, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useI18n } from "../state/i18n";
import { useUi } from "../state/ui";

export function HomePage() {
  const { token, user } = useAuth();
  const { openAuthModal } = useUi();
  const { t } = useI18n();

  const stats = [
    { label: t("home.statsArticles"), value: "197" },
    { label: t("home.statsReady"), value: "Loki" },
    { label: t("home.statsSafe"), value: "100%" }
  ];

  return (
    <div className="ticol-container py-8">
      <section className="card overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr] 2xl:grid-cols-[1.2fr_0.9fr]">
          <div className="p-8 md:p-12 2xl:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-brandOrange/20 bg-brandOrange/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brandOrange">
              <Sparkles className="h-4 w-4" />
              TICOL
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-balance md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/68 dark:text-white/68">
              {t("home.heroLead")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/constitution" className="btn-primary">
                {t("home.primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!token ? (
                <button className="btn-secondary" onClick={() => openAuthModal({ reason: t("auth.reasonDefault") })}>
                  {t("home.secondary")}
                </button>
              ) : (
                <div className="rounded-full border border-black/5 bg-black/5 px-4 py-2 text-sm font-semibold text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                  {t("home.greeting", { name: user?.name || "" })}
                </div>
              )}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-black/5 bg-white/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brandBlue/20 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-brandOrange/25"
                >
                  <div className="text-2xl font-black text-brandBlue dark:text-brandOrange">{stat.value}</div>
                  <div className="mt-1 text-sm text-black/60 dark:text-white/65">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative border-t border-black/5 bg-gradient-to-br from-brandBlue/10 via-white to-brandOrange/15 p-8 lg:border-l lg:border-t-0 2xl:p-10 dark:border-white/10 dark:from-white/5 dark:via-white/0 dark:to-brandOrange/10">
            <div className="grid gap-4 2xl:gap-5">
              <FeatureCard icon={<Search className="h-5 w-5" />} title={t("home.featureSearchTitle")} text={t("home.featureSearchText")} />
              <FeatureCard icon={<Heart className="h-5 w-5" />} title={t("home.featureFavoritesTitle")} text={t("home.featureFavoritesText")} />
              <FeatureCard icon={<MessageSquare className="h-5 w-5" />} title={t("home.featureChatTitle")} text={t("home.featureChatText")} />
              <div className="rounded-3xl border border-dashed border-brandOrange/30 bg-white/60 p-5 dark:border-brandOrange/30 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-brandOrange" />
                  <div className="text-sm font-semibold text-black/75 dark:text-white/80">
                    {t("home.statsSafe")}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/65">
                  {t("home.designNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/75 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brandBlue/20 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-brandOrange/25">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brandBlue/10 text-brandBlue dark:bg-white/10 dark:text-white">
          {icon}
        </div>
        <div className="text-base font-bold text-black dark:text-white">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/65">{text}</p>
    </div>
  );
}
