import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { AuthModal } from "./auth/AuthModal";
import { PasswordModal } from "./auth/PasswordModal";
import { ChatWidget } from "./chat/ChatWidget";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(250,120,1,0.12),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#fbf8f1_100%)] text-textLight transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(250,120,1,0.12),_transparent_24%),linear-gradient(180deg,_#1c1b1b_0%,_#111111_100%)] dark:text-white">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
      <AuthModal />
      <PasswordModal />
      <ChatWidget />
    </div>
  );
}