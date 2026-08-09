import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Home,
  Heart,
  Info,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserCog,
  UserPlus,
  X
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useI18n } from "../state/i18n";
import { useTheme } from "../state/theme";
import { useUi } from "../state/ui";
import { clsx } from "../utils/clsx";
import { ConfirmModal } from "./ConfirmModal";

const brandName = import.meta.env.VITE_APP_BRAND_NAME || "TICOL";

export function Navbar() {
  const { token, user, logout } = useAuth();
  const { openAuthModal, openPasswordModal } = useUi();
  const { theme, toggleTheme, fontSize, setFontSize, highContrast, toggleHighContrast } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionsMenuOpen, setSectionsMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sectionsMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileNavButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateNavbarHeight = () => {
      document.documentElement.style.setProperty("--navbar-height", `${header.offsetHeight}px`);
    };

    updateNavbarHeight();

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateNavbarHeight);
    observer?.observe(header);
    window.addEventListener("resize", updateNavbarHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (!sectionsMenuRef.current?.contains(event.target as Node)) {
        setSectionsMenuOpen(false);
      }
      if (
        !mobileNavRef.current?.contains(event.target as Node) &&
        !mobileNavButtonRef.current?.contains(event.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setSectionsMenuOpen(false);
      setMobileNavOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    setSectionsMenuOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "inline-flex shrink-0 items-center gap-2 rounded-xl px-[clamp(0.7rem,0.65vw,0.95rem)] py-2 text-[clamp(0.85rem,0.72vw,0.98rem)] font-semibold whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-brandOrange/40",
      isActive
        ? "bg-brandBlue text-white dark:bg-white/10 dark:text-brandOrange"
        : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
    );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-lg dark:border-white/10 dark:bg-[#1f1e1e]/85"
    >
      <div className="w-full px-3 py-3 sm:px-4 lg:px-6 2xl:px-8">
        <div className="grid items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4 2xl:gap-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 justify-self-start">
            <img src="/logo-ticol.svg" alt={t("brand.title")} className="h-11 w-11 shrink-0 object-contain" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-extrabold tracking-wide text-black dark:text-white">
                {brandName}
              </div>
              <div className="hidden truncate text-[11px] text-black/50 xl:block dark:text-white/55">
                {t("brand.subtitle")}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center justify-center gap-1 xl:flex xl:flex-nowrap xl:gap-1.5 2xl:gap-2">
            <NavLink to="/" className={navClass}>
              <Home className="h-5 w-5" />
              {t("nav.home")}
            </NavLink>
            <NavLink to="/constitution" className={navClass}>
              <BookOpen className="h-5 w-5" />
              {t("nav.constitution")}
            </NavLink>
            <NavLink to="/chatbot" className={navClass}>
              <MessageSquare className="h-5 w-5" />
              {t("nav.chatbot")}
            </NavLink>
            <NavLink to="/favorites" className={navClass}>
              <Heart className="h-5 w-5" />
              {t("nav.favorites")}
            </NavLink>
            <NavLink to="/about" className={navClass}>
              <Info className="h-5 w-5" />
              {t("nav.about")}
            </NavLink>
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3 justify-self-end">
            <button
              type="button"
              ref={mobileNavButtonRef}
              className="btn-secondary inline-flex lg:hidden"
              onClick={() => setMobileNavOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              >
                {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

            <div className="relative hidden lg:block xl:hidden" ref={sectionsMenuRef}>
              <button
                type="button"
                className="btn-secondary inline-flex whitespace-nowrap"
                onClick={() => setSectionsMenuOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={sectionsMenuOpen}
                aria-label={t("nav.sections")}
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.sections")}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {sectionsMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-black/10 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-[#232222]"
                >
                  <div className="grid gap-2">
                    <NavLink
                      to="/"
                      className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      {t("nav.home")}
                    </NavLink>
                    <NavLink
                      to="/constitution"
                      className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      {t("nav.constitution")}
                    </NavLink>
                    <NavLink
                      to="/chatbot"
                      className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t("nav.chatbot")}
                    </NavLink>
                    <NavLink
                      to="/favorites"
                      className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      {t("nav.favorites")}
                    </NavLink>
                    <NavLink
                      to="/about"
                      className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <Info className="h-4 w-4" />
                      {t("nav.about")}
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setMenuOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t("nav.accessibility")}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.accessibility")}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-[22rem] rounded-2xl border border-black/10 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-[#232222]"
                >
                  <div className="space-y-3">
                    <div className="rounded-xl border border-black/5 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/80 text-brandBlue dark:bg-white/10 dark:text-brandOrange">
                            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          </div>
                          <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                            {t("common.theme")}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-black/80 dark:text-white/80">
                            {theme === "dark" ? t("common.darkMode") : t("common.lightMode")}
                          </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={theme === "dark"}
                          className={clsx(
                            "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                            theme === "dark"
                              ? "border-brandOrange/30 bg-brandOrange"
                              : "border-black/10 bg-black/20 dark:border-white/15 dark:bg-white/20"
                          )}
                          onClick={toggleTheme}
                          aria-label={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
                        >
                          <span className="sr-only">
                            {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
                          </span>
                          <span
                            className={clsx(
                              "inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
                              theme === "dark" ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-black/80 dark:text-white/80">
                          {t("common.highContrast")}
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={highContrast}
                          className={clsx(
                            "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                            highContrast
                              ? "border-brandOrange/30 bg-brandOrange"
                              : "border-black/10 bg-black/20 dark:border-white/15 dark:bg-white/20"
                          )}
                          onClick={toggleHighContrast}
                        >
                          <span
                            className={clsx(
                              "inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
                              highContrast ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                        {t("common.fontSize")}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(["sm", "md", "lg"] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={clsx(
                              "rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brandOrange/40",
                              fontSize === size
                                ? "border-brandOrange/40 bg-brandOrange text-white"
                                : "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                            )}
                            onClick={() => setFontSize(size)}
                          >
                            {size === "sm" ? t("common.small") : size === "md" ? t("common.medium") : t("common.large")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                        {t("common.language")}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["es", "en"] as const).map((nextLanguage) => (
                          <button
                            key={nextLanguage}
                            type="button"
                            className={clsx(
                              "rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brandOrange/40",
                              language === nextLanguage
                                ? "border-brandOrange/40 bg-brandOrange text-white"
                                : "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                            )}
                            onClick={() => void setLanguage(nextLanguage)}
                          >
                            {nextLanguage === "es" ? t("common.spanish") : t("common.english")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {token && (
                      <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                          {t("nav.account")}
                        </div>
                        <button
                          type="button"
                          className="btn-secondary mt-3 w-full justify-start"
                          onClick={() => {
                            openPasswordModal();
                            setMenuOpen(false);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                          {t("auth.changePasswordTitle")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!token ? (
              <div className="flex items-center gap-2">
                <button
                  className="btn-primary whitespace-nowrap"
                  onClick={() => openAuthModal({ reason: t("auth.reasonDefault"), mode: "login" })}
                >
                  <LogIn className="h-4 w-4" />
                  {t("nav.login")}
                </button>
                <button
                  className="btn-secondary hidden whitespace-nowrap xl:inline-flex"
                  onClick={() => openAuthModal({ reason: t("auth.reasonDefault"), mode: "register" })}
                >
                  <UserPlus className="h-4 w-4" />
                  {t("auth.registerTitle")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="max-w-[180px] truncate rounded-full bg-black/5 px-3 py-2 text-sm font-semibold text-black/70 dark:bg-white/5 dark:text-white/75">
                  {user?.name}
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={logoutConfirmOpen}
        title={t("nav.logoutConfirmTitle")}
        description={t("nav.logoutConfirmDescription")}
        confirmLabel={t("nav.logout")}
        cancelLabel={t("common.cancel")}
        confirmButtonClassName="btn-orange"
        busy={false}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          await logout();
          setLogoutConfirmOpen(false);
        }}
      />

      {mobileNavOpen && (
        <div className="lg:hidden">
          <div ref={mobileNavRef} className="w-full px-3 pb-3">
            <div className="w-full rounded-3xl border border-black/5 bg-white/95 p-3 shadow-soft dark:border-white/10 dark:bg-[#232222]/95">
              <div className="grid gap-2">
                <NavLink to="/" className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}>
                  <Home className="h-4 w-4" />
                  {t("nav.home")}
                </NavLink>
                <NavLink
                  to="/constitution"
                  className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                >
                  <BookOpen className="h-4 w-4" />
                  {t("nav.constitution")}
                </NavLink>
                <NavLink to="/chatbot" className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}>
                  <MessageSquare className="h-4 w-4" />
                  {t("nav.chatbot")}
                </NavLink>
                <NavLink
                  to="/favorites"
                  className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}
                >
                  <Heart className="h-4 w-4" />
                  {t("nav.favorites")}
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => clsx(navClass({ isActive }), "w-full justify-start")}>
                  <Info className="h-4 w-4" />
                  {t("nav.about")}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

