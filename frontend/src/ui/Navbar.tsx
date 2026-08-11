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
    setMenuOpen(false);
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
      <div className="w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 2xl:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4 2xl:gap-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 justify-self-start sm:gap-3">
            <img
              src="/logo-ticol.svg"
              alt={t("brand.title")}
              className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
            />
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

          <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end md:gap-3">
            <button
              type="button"
              ref={mobileNavButtonRef}
              className="btn-secondary inline-flex h-11 w-11 shrink-0 p-0 lg:hidden"
              onClick={() => {
                setMobileNavOpen((current) => !current);
                setMenuOpen(false);
                setSectionsMenuOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

            <div className="relative hidden lg:block xl:hidden" ref={sectionsMenuRef}>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-11 whitespace-nowrap"
                onClick={() => {
                  setSectionsMenuOpen((current) => !current);
                  setMenuOpen(false);
                  setMobileNavOpen(false);
                }}
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
                  className="fixed left-1/2 top-[calc(var(--navbar-height,4.5rem)+0.5rem)] z-[45] max-h-[calc(100dvh-var(--navbar-height,4.5rem)-1rem)] w-[calc(100%-1rem)] max-w-xs -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-[#232222]"
                >
                  <div className="grid gap-2">
                    <NavLink
                      to="/"
                      className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      {t("nav.home")}
                    </NavLink>
                    <NavLink
                      to="/constitution"
                      className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      {t("nav.constitution")}
                    </NavLink>
                    <NavLink
                      to="/chatbot"
                      className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t("nav.chatbot")}
                    </NavLink>
                    <NavLink
                      to="/favorites"
                      className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                      onClick={() => setSectionsMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      {t("nav.favorites")}
                    </NavLink>
                    <NavLink
                      to="/about"
                      className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
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
                className="btn-secondary hidden min-h-11 lg:inline-flex"
                onClick={() => {
                  setMenuOpen((current) => !current);
                  setSectionsMenuOpen(false);
                  setMobileNavOpen(false);
                }}
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
                  className="fixed left-1/2 top-[calc(var(--navbar-height,4.5rem)+0.5rem)] z-[45] max-h-[calc(100dvh-var(--navbar-height,4.5rem)-1rem)] w-[calc(100%-1rem)] max-w-[22rem] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-[#232222]"
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
                          className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-xl transition hover:bg-black/5 dark:hover:bg-white/10"
                          onClick={() => {
                            toggleTheme();
                            setMenuOpen(false);
                          }}
                          aria-label={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
                        >
                          <span className="sr-only">
                            {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
                          </span>
                          <span
                            className={clsx(
                              "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                              theme === "dark"
                                ? "border-brandOrange/30 bg-brandOrange"
                                : "border-black/10 bg-black/20 dark:border-white/15 dark:bg-white/20"
                            )}
                          >
                            <span
                              className={clsx(
                                "inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
                                theme === "dark" ? "translate-x-5" : "translate-x-1"
                              )}
                            />
                          </span>
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
                          className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-xl transition hover:bg-black/5 dark:hover:bg-white/10"
                          onClick={() => {
                            toggleHighContrast();
                            setMenuOpen(false);
                          }}
                        >
                          <span
                            className={clsx(
                              "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                              highContrast
                                ? "border-brandOrange/30 bg-brandOrange"
                                : "border-black/10 bg-black/20 dark:border-white/15 dark:bg-white/20"
                            )}
                          >
                            <span
                              className={clsx(
                                "inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
                                highContrast ? "translate-x-5" : "translate-x-1"
                              )}
                            />
                          </span>
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
                              "min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brandOrange/40",
                              fontSize === size
                                ? "border-brandOrange/40 bg-brandOrange text-white"
                                : "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                            )}
                            onClick={() => {
                              setFontSize(size);
                              setMenuOpen(false);
                            }}
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
                              "min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brandOrange/40",
                              language === nextLanguage
                                ? "border-brandOrange/40 bg-brandOrange text-white"
                                : "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                            )}
                            onClick={() => {
                              setLanguage(nextLanguage);
                              setMenuOpen(false);
                            }}
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
                          className="btn-secondary mt-3 min-h-11 w-full justify-start"
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
              <div className="hidden items-center gap-2 lg:flex">
                <button
                  className="btn-primary min-h-11 whitespace-nowrap"
                  onClick={() => openAuthModal({ reason: t("auth.reasonDefault"), mode: "login" })}
                >
                  <LogIn className="h-4 w-4" />
                  {t("nav.login")}
                </button>
                <button
                  className="btn-secondary hidden min-h-11 whitespace-nowrap xl:inline-flex"
                  onClick={() => openAuthModal({ reason: t("auth.reasonDefault"), mode: "register" })}
                >
                  <UserPlus className="h-4 w-4" />
                  {t("auth.registerTitle")}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <div className="max-w-[180px] truncate rounded-full bg-black/5 px-3 py-2 text-sm font-semibold text-black/70 dark:bg-white/5 dark:text-white/75">
                  {user?.name}
                </div>
                <button
                  className="btn-secondary min-h-11"
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
        <div className="fixed left-1/2 top-[calc(var(--navbar-height,4rem)+0.5rem)] z-[45] w-[calc(100%-1rem)] max-w-md -translate-x-1/2 lg:hidden">
          <div
            ref={mobileNavRef}
            role="menu"
            className="max-h-[calc(100dvh-var(--navbar-height,4rem)-1rem)] w-full overflow-y-auto overscroll-contain rounded-3xl border border-black/5 bg-white/95 p-3 shadow-soft backdrop-blur-lg dark:border-white/10 dark:bg-[#232222]/95"
          >
              <div className="grid gap-2 text-center">
                <NavLink
                  to="/"
                  className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  {t("nav.home")}
                </NavLink>
                <NavLink
                  to="/constitution"
                  className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <BookOpen className="h-5 w-5" />
                  {t("nav.constitution")}
                </NavLink>
                <NavLink
                  to="/chatbot"
                  className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <MessageSquare className="h-5 w-5" />
                  {t("nav.chatbot")}
                </NavLink>
                <NavLink
                  to="/favorites"
                  className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  {t("nav.favorites")}
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) => clsx(navClass({ isActive }), "min-h-11 w-full justify-center text-center")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Info className="h-5 w-5" />
                  {t("nav.about")}
                </NavLink>
              </div>

              <div className="my-3 h-px bg-black/5 dark:bg-white/10" />

              <button
                type="button"
                className="btn-secondary min-h-11 w-full justify-center text-center"
                onClick={() => {
                  setMobileNavOpen(false);
                  setMenuOpen(true);
                }}
              >
                <Settings className="h-5 w-5" />
                {t("nav.accessibility")}
              </button>

              {!token ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="btn-primary min-h-11 w-full"
                    onClick={() => {
                      setMobileNavOpen(false);
                      openAuthModal({ reason: t("auth.reasonDefault"), mode: "login" });
                    }}
                  >
                    <LogIn className="h-5 w-5" />
                    {t("nav.login")}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary min-h-11 w-full"
                    onClick={() => {
                      setMobileNavOpen(false);
                      openAuthModal({ reason: t("auth.reasonDefault"), mode: "register" });
                    }}
                  >
                    <UserPlus className="h-5 w-5" />
                    {t("auth.registerTitle")}
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid gap-2 text-center">
                  <div className="truncate rounded-xl bg-black/5 px-3 py-3 text-sm font-semibold text-black/70 dark:bg-white/5 dark:text-white/75">
                    {user?.name}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary min-h-11 w-full"
                    onClick={() => {
                      setMobileNavOpen(false);
                      openPasswordModal();
                    }}
                  >
                    <UserCog className="h-5 w-5" />
                    {t("auth.changePasswordTitle")}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary min-h-11 w-full"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    {t("nav.logout")}
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </header>
  );
}

