import { Facebook, Github, Globe, Instagram, Mail, Linkedin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../state/i18n";

const brandName = import.meta.env.VITE_APP_BRAND_NAME || "TICOL";

export function Footer() {
  const { t } = useI18n();
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";

  return (
    <footer
      id="app-footer"
      className={isAboutPage ? "relative z-10 mt-8 border-t border-black/5 bg-brandBrown text-[#f8ecd2] dark:border-white/10" : "relative z-10 mt-8 hidden border-t border-black/5 bg-brandBrown text-[#f8ecd2] md:block dark:border-white/10"}
    >
      <div className="ticol-container py-6 md:py-7">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[1.15fr_0.9fr_1fr] 2xl:gap-8">
          <div>
            <div className="text-sm font-extrabold">{brandName}</div>
            <p className="mt-2 text-sm leading-6 text-[#f8ecd2]/90">{t("about.lead")}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#f8ecd2]/80">
              <Globe className="h-4 w-4" />
              {t("footer.location")}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.contact")}</div>
            <div className="mt-2 space-y-2 text-sm text-[#f8ecd2]/90">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                beckfordandy1@gmail.com
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                2018468@est.cedesdonbosco.ed.cr
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.links")}</div>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <a
                className="text-[#f8ecd2]/90 hover:underline"
                href="/constitucionPolitica.pdf"
                download="constitucionPolitica.pdf"
              >
                {t("footer.downloadConstitution")}
              </a>
              <Link className="text-[#f8ecd2]/90 hover:underline" to="/about">
                {t("about.title")}
              </Link>
              <a className="text-[#f8ecd2]/90 hover:underline" href="#">
                {t("footer.privacyPolicy")}
              </a>
              <a className="text-[#f8ecd2]/90 hover:underline" href="#">
                {t("footer.termsOfUse")}
              </a>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                className="inline-flex items-center justify-center rounded-xl border border-[#f8ecd2]/20 bg-[#f8ecd2]/10 px-3 py-2 text-[#f8ecd2] transition hover:bg-[#f8ecd2]/20"
                href="https://www.instagram.com/itssss_bck4?igsh=Y2VxNDhmdDlteXQ3"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-[#f8ecd2]/20 bg-[#f8ecd2]/10 px-3 py-2 text-[#f8ecd2] transition hover:bg-[#f8ecd2]/20"
                href="https://www.linkedin.com/in/andy-beckford-guerrero-786ba5210"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-[#f8ecd2]/20 bg-[#f8ecd2]/10 px-3 py-2 text-[#f8ecd2] transition hover:bg-[#f8ecd2]/20"
                href="https://github.com/AndyPilfo"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-[#f8ecd2]/20 bg-[#f8ecd2]/10 px-3 py-2 text-[#f8ecd2] transition hover:bg-[#f8ecd2]/20"
                href="#"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-[#f8ecd2]/70">
          © {new Date().getFullYear()} {brandName}. {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
