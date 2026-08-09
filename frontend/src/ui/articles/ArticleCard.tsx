import { Heart, Volume2 } from "lucide-react";
import { clsx } from "../../utils/clsx";
import type { Article } from "../../types";
import { useI18n } from "../../state/i18n";

type ArticleCardProps = {
  article: Article;
  favorite?: boolean;
  onToggleFavorite?: (article: Article) => void;
  onSpeak?: (article: Article) => void;
  compact?: boolean;
  actions?: React.ReactNode;
};

export function ArticleCard({ article, favorite, onToggleFavorite, onSpeak, compact, actions }: ArticleCardProps) {
  const { t } = useI18n();

  return (
    <article className="card group overflow-hidden border border-black/5 transition-shadow hover:shadow-soft dark:border-white/10">
      <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-gradient-to-r from-brandBlue/10 via-white to-brandOrange/10 px-5 py-4 dark:border-white/10 dark:from-white/5 dark:via-white/0 dark:to-brandOrange/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
            <span>{t("constitution.pageTitle")}</span>
            <span>·</span>
            <span>{t("article.reference", { titleNumber: article.titleNumber, chapterNumber: article.chapterNumber })}</span>
          </div>
          <h3 className={clsx("mt-2 font-extrabold tracking-tight", compact ? "text-base" : "text-lg")}>
            {t("constitution.articleLabel")} {article.articleNumber}
          </h3>
          <p className="mt-1 text-sm font-medium text-black/60 dark:text-white/60">{article.titleName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onSpeak && (
            <button
              type="button"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black/75 transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brandOrange/30 dark:border-brandOrange/30 dark:bg-brandOrange/10 dark:text-brandOrange dark:hover:bg-brandOrange/15"
              onClick={() => onSpeak(article)}
              aria-label={t("common.readAloud")}
              title={t("common.readAloud")}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              className={clsx(
                "rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-brandOrange/30",
                favorite
                  ? "border-brandOrange/25 bg-brandOrange text-white"
                  : "border-black/10 bg-white text-black/75 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              )}
              onClick={() => onToggleFavorite(article)}
              aria-pressed={Boolean(favorite)}
              aria-label={favorite ? t("common.unfavorite") : t("common.favorite")}
              title={favorite ? t("common.unfavorite") : t("common.favorite")}
            >
              <Heart className={clsx("h-4 w-4", favorite && "fill-white")} />
            </button>
          )}
          {actions}
        </div>
      </div>

      <div className="px-5 py-5">
        <p className={clsx("article-text text-sm leading-7 text-black/80 dark:text-white/80", compact && "line-clamp-6")}>
          {article.text}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-black/55 dark:text-white/55">
          <span className="rounded-full bg-brandBlue/10 px-3 py-1 font-semibold text-brandBlue dark:bg-white/10 dark:text-white">
            {article.titleName}
          </span>
          <span className="rounded-full bg-brandBrown/10 px-3 py-1 font-semibold text-brandBrown dark:bg-white/10 dark:text-white">
            {article.chapterName}
          </span>
        </div>
      </div>
    </article>
  );
}
