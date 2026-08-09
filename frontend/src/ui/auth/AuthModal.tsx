import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../state/auth";
import { useI18n } from "../../state/i18n";
import { useUi } from "../../state/ui";

type Mode = "login" | "register";

export function AuthModal() {
  const navigate = useNavigate();
  const { authModal, closeAuthModal } = useUi();
  const { setSession } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")), [mode, t]);

  useEffect(() => {
    if (!authModal.open) return;
    setMode(authModal.mode ?? "login");
    setError(null);
    setBusy(false);
    setPassword("");
    setShowPassword(false);
  }, [authModal.mode, authModal.open]);

  if (!authModal.open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const response =
        mode === "register"
          ? await api.register({ name: name.trim(), email: trimmedEmail, password })
          : await api.login({ email: trimmedEmail, password });

      setSession(response.token, response.user);
      closeAuthModal();
      if (authModal.returnTo) navigate(authModal.returnTo);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("chat.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold">{title}</div>
            <div className="mt-1 text-sm text-black/60 dark:text-white/60">
              {authModal.reason || t("auth.reasonDefault")}
            </div>
          </div>
          <button className="btn-secondary" onClick={closeAuthModal} aria-label={t("common.close")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className={mode === "login" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("login")}
            type="button"
          >
            {t("auth.loginTitle")}
          </button>
          <button
            className={mode === "register" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("register")}
            type="button"
          >
            {t("auth.registerTitle")}
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={submit}>
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.name")}</label>
              <input
                className="input mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("auth.name")}
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.email")}</label>
            <input
              className="input mt-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.password")}</label>
            <div className="relative mt-2">
              <input
                className="input pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.passwordHint")}
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

          <button className="btn-orange w-full" disabled={busy} type="submit">
            {busy ? t("common.loading") : mode === "login" ? t("auth.loginButton") : t("auth.registerButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
