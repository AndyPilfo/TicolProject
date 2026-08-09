import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type AuthModalState = {
  open: boolean;
  reason: string;
  returnTo?: string;
  mode?: "login" | "register";
};

type PasswordModalState = {
  open: boolean;
};

type UiContextValue = {
  authModal: AuthModalState;
  passwordModal: PasswordModalState;
  chatWidgetOpen: boolean;
  openAuthModal: (args?: { reason?: string; returnTo?: string; mode?: "login" | "register" }) => void;
  closeAuthModal: () => void;
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  openChatWidget: () => void;
  closeChatWidget: () => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    reason: "Inicia sesión para continuar."
  });
  const [passwordModal, setPasswordModal] = useState<PasswordModalState>({ open: false });
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const openAuthModal = useCallback((args?: { reason?: string; returnTo?: string; mode?: "login" | "register" }) => {
    setAuthModal({
      open: true,
      reason: args?.reason ?? "Inicia sesión para continuar.",
      returnTo: args?.returnTo,
      mode: args?.mode
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((current) => ({ ...current, open: false }));
  }, []);

  const openPasswordModal = useCallback(() => {
    setPasswordModal({ open: true });
  }, []);

  const closePasswordModal = useCallback(() => {
    setPasswordModal({ open: false });
  }, []);

  const openChatWidget = useCallback(() => {
    setChatWidgetOpen(true);
  }, []);

  const closeChatWidget = useCallback(() => {
    setChatWidgetOpen(false);
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      authModal,
      passwordModal,
      chatWidgetOpen,
      openAuthModal,
      closeAuthModal,
      openPasswordModal,
      closePasswordModal,
      openChatWidget,
      closeChatWidget
    }),
    [
      authModal,
      chatWidgetOpen,
      closeAuthModal,
      closeChatWidget,
      closePasswordModal,
      openAuthModal,
      openChatWidget,
      openPasswordModal,
      passwordModal
    ]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
