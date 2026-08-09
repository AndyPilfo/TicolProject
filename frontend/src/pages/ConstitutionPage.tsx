import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronRight, Filter, Heart, Menu, Search, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../state/auth";
import { useI18n } from "../state/i18n";
import { useUi } from "../state/ui";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import type { Article, TitleNavigation } from "../types";
import { ArticleCard } from "../ui/articles/ArticleCard";
import { SlideOver } from "../ui/SlideOver";
import { clsx } from "../utils/clsx";
import { useFavorites } from "../state/favorites";

export function ConstitutionPage() {
  const { token } = useAuth();
  const { openAuthModal } = useUi();
  const { t, language } = useI18n();
  const { speak } = useSpeechSynthesis();
  const { favoriteIds, toggleFavorite: syncFavorite } = useFavorites();

  const [q, setQ] = useState("");
  const [title, setTitle] = useState<number | "">("");
  const [chapter, setChapter] = useState<number | "">("");
  const [article, setArticle] = useState<number | "">("");
  const [titles, setTitles] = useState<TitleNavigation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const deferredQuery = useDeferredValue(q);

  const availableChapters = useMemo(() => {
    const selectedTitle = titles.find((entry) => entry.number === title);
    return selectedTitle?.chapters ?? [];
  }, [title, titles]);

  const totalArticles = useMemo(
    () => titles.reduce((count, entry) => count + entry.articleCount, 0),
    [titles]
  );

  const loadArticles = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const response = await api.getArticles({
          q: deferredQuery.trim() || undefined,
          title: title || undefined,
          chapter: chapter || undefined,
          article: article || undefined
        });
        setTitles(response.navigation.titles);
        setArticles(response.articles);
        setError(null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : t("common.empty"));
      } finally {
        setLoading(false);
      }
    },
    [article, chapter, deferredQuery, t, title]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadArticles();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadArticles]);

  useEffect(() => {
    if (!title) setChapter("");
  }, [title]);

  async function toggleFavorite(articleItem: Article) {
    if (!token) {
      openAuthModal({ reason: t("auth.reasonDefault"), returnTo: "/constitution" });
      return;
    }

    try {
      await syncFavorite(articleItem);
    } catch {
      // The favorites context restores the last confirmed server state.
    }
  }

  function speakArticle(articleItem: Article) {
    speak(`${articleItem.titleName}. ${t("constitution.articleLabel")} ${articleItem.articleNumber}. ${articleItem.text}`, language);
  }

  function resetFilters() {
    setQ("");
    setTitle("");
    setChapter("");
    setArticle("");
  }

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-black/10 bg-[#f5f5f5] shadow-soft dark:border-white/10 dark:bg-[#262626]">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-4 dark:border-white/10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
            <Filter className="h-4 w-4" />
            {t("constitution.filters")}
          </div>
          <h1 className="mt-1 truncate text-xl font-black tracking-tight">{t("constitution.pageTitle")}</h1>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-brandOrange/30 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 lg:hidden"
          onClick={() => setSidebarCompact((current) => !current)}
          aria-label={sidebarCompact ? t("constitution.expandFilters") : t("constitution.collapseFilters")}
          title={sidebarCompact ? t("constitution.expandFilters") : t("constitution.collapseFilters")}
        >
          <ChevronRight className={clsx("h-4 w-4 transition-transform", sidebarCompact && "rotate-180")} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="text-sm leading-6 text-black/65 dark:text-white/65">{t("constitution.pageLead")}</p>

        <div className="mt-5 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
            {t("constitution.searchPlaceholder")}
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/45" />
            <input
              className="input pl-10"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={t("constitution.searchPlaceholder")}
              aria-label={t("constitution.searchPlaceholder")}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                {t("constitution.titleLabel")}
              </label>
              <select
                className="input mt-2"
                value={title}
                onChange={(event) => setTitle(event.target.value ? Number(event.target.value) : "")}
              >
                <option value="">{t("constitution.allTitles")}</option>
                {titles.map((entry) => (
                  <option key={entry.number} value={entry.number}>
                    {entry.number} · {entry.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                {t("constitution.chapterLabel")}
              </label>
              <select
                className="input mt-2"
                value={chapter}
                onChange={(event) => setChapter(event.target.value ? Number(event.target.value) : "")}
                disabled={!title}
              >
                <option value="">{t("constitution.allChapters")}</option>
                {availableChapters.map((entry) => (
                  <option key={entry.number} value={entry.number}>
                    {entry.number} · {entry.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                {t("constitution.articleLabel")}
              </label>
              <input
                className="input mt-2"
                value={article}
                onChange={(event) => setArticle(event.target.value ? Number(event.target.value) : "")}
                placeholder="10"
                inputMode="numeric"
                aria-label={t("constitution.articleLabel")}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={resetFilters}>
              {t("common.clearFilters")}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
            <BookOpen className="h-4 w-4" />
            {t("constitution.categoryNav")}
          </div>
          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            <button type="button" className={categoryButtonClass(!title)} onClick={() => setTitle("")}>
              <span>{t("constitution.allTitles")}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            {titles.map((entry) => (
              <button
                key={entry.number}
                type="button"
                className={categoryButtonClass(title === entry.number)}
                onClick={() => setTitle(entry.number)}
              >
                <span>
                  {entry.number}. {entry.name}
                </span>
                <span className="text-xs opacity-70">
                  {entry.articleCount} {t("constitution.totalArticles")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Metric label={t("constitution.results")} value={String(articles.length)} />
          <Metric label={t("home.statsArticles")} value={String(totalArticles)} />
        </div>
      </div>
    </div>
  );

  const compactSidebar = (
    <div className="flex h-full min-h-0 flex-col items-center gap-4 rounded-none border border-black/10 bg-[#f5f5f5] p-3 shadow-soft dark:border-white/10 dark:bg-[#262626]">
      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-2xl bg-brandBlue text-white shadow-sm transition hover:bg-[#0a57c3] focus:outline-none focus:ring-2 focus:ring-brandOrange/30"
        onClick={() => setSidebarCompact(false)}
        aria-label={t("constitution.expandFilters")}
        title={t("constitution.expandFilters")}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="space-y-2 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-brandOrange/15 text-brandOrange">
          <Filter className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
          {t("constitution.filters")}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-2">
        <MetricCompact label={t("constitution.results")} value={String(articles.length)} />
        <MetricCompact label={t("home.statsArticles")} value={String(totalArticles)} />
      </div>

      <button
        type="button"
        className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-3 text-xs font-semibold text-black/70 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-brandOrange/30 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
        onClick={() => setSidebarCompact(false)}
      >
        {t("constitution.expandSidebar")}
      </button>
    </div>
  );

  return (
    <div
      className={clsx(
        "constitution-page overflow-x-hidden py-4 sm:py-6 xl:py-8",
        sidebarCompact && "is-sidebar-collapsed"
      )}
    >
      <div className="page-layout-grid grid gap-0 transition-[grid-template-columns] duration-300 ease-out">
        <aside className="page-filter-sidebar hidden lg:block lg:self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
          <div
            className={clsx(
              "page-filter-shell h-full transition-[width] duration-300 ease-out",
              sidebarCompact ? "lg:w-[92px] 2xl:w-[96px]" : "lg:w-[360px] 2xl:w-[420px]"
            )}
          >
            {sidebarCompact ? compactSidebar : sidebarContent}
          </div>
        </aside>

        <main className="page-main-panel min-w-0">
          <section className="card overflow-visible">
            <div className="min-w-0 px-4 py-5 sm:px-6 md:px-8 lg:py-8">
              <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                    {t("constitution.readingInterface")}
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">{t("constitution.pageTitle")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-2 text-sm font-semibold text-black/65 dark:border-white/10 dark:bg-white/5 dark:text-white/70 lg:hidden"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                    {t("common.filters")}
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-2 text-sm font-semibold text-black/65 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                    <Sparkles className="h-4 w-4 text-brandOrange" />
                    {articles.length} {t("constitution.totalArticles")}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
                <Metric label={t("constitution.results")} value={String(articles.length)} />
                <Metric label={t("home.statsArticles")} value={String(totalArticles)} />
              </div>

              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="grid gap-4">
                {loading ? (
                  <LoadingCards />
                ) : articles.length === 0 ? (
                  <EmptyResults message={t("constitution.empty")} />
                ) : (
                  articles.map((articleItem) => (
                    <ArticleCard
                      key={articleItem.id}
                      article={articleItem}
                      favorite={favoriteIds.has(articleItem.id)}
                      onToggleFavorite={toggleFavorite}
                      onSpeak={speakArticle}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          </section>
        </main>
      </div>

      <SlideOver
        open={mobileFiltersOpen}
        title={t("constitution.filters")}
        onClose={() => setMobileFiltersOpen(false)}
        widthClassName="w-[94vw] max-w-md"
      >
        <div className="flex h-full min-h-0 flex-col p-4">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm leading-6 text-black/65 dark:text-white/65">{t("constitution.pageLead")}</p>

              <div className="mt-5 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
                  {t("constitution.searchPlaceholder")}
                </label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/45" />
                  <input
                    className="input pl-10"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder={t("constitution.searchPlaceholder")}
                    aria-label={t("constitution.searchPlaceholder")}
                  />
                </div>

                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                      {t("constitution.titleLabel")}
                    </label>
                    <select
                      className="input mt-2"
                      value={title}
                      onChange={(event) => setTitle(event.target.value ? Number(event.target.value) : "")}
                    >
                      <option value="">{t("constitution.allTitles")}</option>
                      {titles.map((entry) => (
                        <option key={entry.number} value={entry.number}>
                          {entry.number} · {entry.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                      {t("constitution.chapterLabel")}
                    </label>
                    <select
                      className="input mt-2"
                      value={chapter}
                      onChange={(event) => setChapter(event.target.value ? Number(event.target.value) : "")}
                      disabled={!title}
                    >
                      <option value="">{t("constitution.allChapters")}</option>
                      {availableChapters.map((entry) => (
                        <option key={entry.number} value={entry.number}>
                          {entry.number} · {entry.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-black/55 dark:text-white/55">
                      {t("constitution.articleLabel")}
                    </label>
                    <input
                      className="input mt-2"
                      value={article}
                      onChange={(event) => setArticle(event.target.value ? Number(event.target.value) : "")}
                      placeholder="10"
                      inputMode="numeric"
                      aria-label={t("constitution.articleLabel")}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" className="btn-secondary flex-1" onClick={resetFilters}>
                    {t("common.clearFilters")}
                  </button>
                  <button type="button" className="btn-orange flex-1" onClick={() => setMobileFiltersOpen(false)}>
                    {t("common.close")}
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
                  <BookOpen className="h-4 w-4" />
                  {t("constitution.categoryNav")}
                </div>
                <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  <button type="button" className={categoryButtonClass(!title)} onClick={() => setTitle("")}>
                    <span>{t("constitution.allTitles")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {titles.map((entry) => (
                    <button
                      key={entry.number}
                      type="button"
                      className={categoryButtonClass(title === entry.number)}
                      onClick={() => setTitle(entry.number)}
                    >
                      <span>
                        {entry.number}. {entry.name}
                      </span>
                      <span className="text-xs opacity-70">
                        {entry.articleCount} {t("constitution.totalArticles")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideOver>

    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">{label}</div>
      <div className="mt-2 text-2xl font-black text-brandBlue dark:text-brandOrange">{value}</div>
    </div>
  );
}

function MetricCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 px-3 py-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-brandBlue dark:text-brandOrange">{value}</div>
    </div>
  );
}

function LoadingCards() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-black/5 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <div className="h-4 w-24 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-4 h-6 w-40 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-11/12 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-10/12 rounded-full bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyResults({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brandOrange/10 text-brandOrange">
        <Heart className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{message}</h3>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">{message}</p>
    </div>
  );
}

function categoryButtonClass(active: boolean) {
  return clsx(
    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brandOrange/30",
    active
      ? "border-brandOrange/30 bg-brandOrange text-white"
      : "border-black/5 bg-white/70 text-black/75 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
  );
}
