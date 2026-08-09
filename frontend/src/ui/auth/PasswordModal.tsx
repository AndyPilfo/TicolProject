import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../state/auth";
import { useI18n } from "../../state/i18n";
import { useUi } from "../../state/ui";

export function PasswordModal() {
  const { passwordModal, closePasswordModal } = useUi();
  const { changePassword } = useAuth();
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!passwordModal.open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(t("auth.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => closePasswordModal(), 900);
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
            <div className="text-lg font-bold">{t("auth.changePasswordTitle")}</div>
            <div className="mt-1 text-sm text-black/60 dark:text-white/60">
              {t("auth.changePasswordDescription")}
            </div>
          </div>
          <button className="btn-secondary" onClick={closePasswordModal} aria-label={t("common.close")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.currentPassword")}</label>
            <div className="relative mt-2">
              <input
                className="input pr-12"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                type={showCurrent ? "text" : "password"}
                placeholder={t("auth.passwordHint")}
                minLength={8}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                onClick={() => setShowCurrent((current) => !current)}
                aria-label={showCurrent ? t("common.hideCurrentPassword") : t("common.showCurrentPassword")}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.newPassword")}</label>
            <div className="relative mt-2">
              <input
                className="input pr-12"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type={showNew ? "text" : "password"}
                placeholder={t("auth.passwordHint")}
                minLength={8}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                onClick={() => setShowNew((current) => !current)}
                aria-label={showNew ? t("common.hideNewPassword") : t("common.showNewPassword")}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">{t("auth.confirmPassword")}</label>
            <input
              className="input mt-2"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder={t("auth.passwordHint")}
              minLength={8}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="text-sm text-emerald-600 dark:text-emerald-400">{success}</div>}

          <button className="btn-orange w-full" disabled={busy} type="submit">
            {busy ? t("common.loading") : t("auth.changePasswordButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
