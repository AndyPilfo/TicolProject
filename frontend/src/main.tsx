import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { App } from "./pages/App";
import "./styles.css";
import { AuthProvider } from "./state/auth";
import { UiProvider } from "./state/ui";
import { ThemeProvider } from "./state/theme";
import { I18nProvider } from "./state/i18n";
import { FavoritesProvider } from "./state/favorites";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <ThemeProvider>
            <I18nProvider>
              <UiProvider>
                <App />
              </UiProvider>
            </I18nProvider>
          </ThemeProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
