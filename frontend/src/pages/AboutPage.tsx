import { FileDown, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "../state/i18n";

export function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="ticol-container py-10">
      <section className="card overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[1.12fr_0.88fr] 2xl:grid-cols-[1.15fr_0.9fr]">
          <div className="p-8 md:p-12 2xl:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-brandOrange/20 bg-brandOrange/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brandOrange">
              <ShieldCheck className="h-4 w-4" />
              {t("about.title")}
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-balance md:text-5xl">
              {t("about.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/68 dark:text-white/68">
              {t("about.lead")}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58 dark:text-white/60">
              {t("about.disclaimer")}
            </p>
            <a className="btn-primary mt-8 inline-flex" href="/constitucionPolitica.pdf" download="constitucionPolitica.pdf">
              <FileDown className="h-4 w-4" />
              {t("about.downloadPdf")}
            </a>
          </div>

          <div className="border-t border-black/5 bg-gradient-to-br from-brandBlue/10 via-white to-brandOrange/15 p-8 lg:border-l lg:border-t-0 2xl:p-10 dark:border-white/10 dark:from-white/5 dark:via-white/0 dark:to-brandOrange/10">
            <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-brandOrange" />
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
                  {t("about.educationalTitle")}
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-black/70 dark:text-white/70">
                <li>• {t("about.bullet1")}</li>
                <li>• {t("about.bullet2")}</li>
                <li>• {t("about.bullet3")}</li>
                <li>• {t("about.bullet4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
