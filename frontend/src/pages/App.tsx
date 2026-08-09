import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "../ui/Layout";
import { AboutPage } from "./AboutPage";
import { ConstitutionPage } from "./ConstitutionPage";
import { FavoritesPage } from "./FavoritesPage";
import { HomePage } from "./HomePage";
import { ChatbotPage } from "./ChatbotPage";
import { useAuth } from "../state/auth";
import { useI18n } from "../state/i18n";
import { useUi } from "../state/ui";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const { openAuthModal } = useUi();
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    if (!ready || token) return;
    openAuthModal({ reason: t("auth.reasonDefault"), returnTo: location.pathname });
  }, [location.pathname, openAuthModal, ready, t, token]);

  if (!ready) {
    return (
      <div className="ticol-container grid place-items-center py-16">
        <div className="card px-6 py-8 text-center text-sm text-black/70 dark:text-white/70">
          {t("app.loadingSession")}
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  useEffect(() => {
    const name = import.meta.env.VITE_APP_BRAND_NAME || "TICOL";
    document.title = name;
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/constitution" element={<ConstitutionPage />} />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <FavoritesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chatbot"
          element={
            <RequireAuth>
              <ChatbotPage />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
