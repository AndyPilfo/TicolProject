import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useI18n } from "../state/i18n";
import { clsx } from "../utils/clsx";

type SlideOverProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
};

export function SlideOver({ open, title, onClose, children, widthClassName = "w-full max-w-md" }: SlideOverProps) {
  const { t } = useI18n();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[50]">
      <button
        type="button"
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("common.closePanel")}
      />
      <div className="absolute inset-0 flex justify-end p-2 sm:p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={clsx(
            "flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft transition-transform duration-200 dark:border-white/10 dark:bg-[#1f1e1e]",
            widthClassName
          )}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-brandBlue px-4 py-3 text-white dark:border-white/10">
            <div className="min-w-0">
              <div id={titleId} className="truncate text-sm font-bold">
                {title}
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              onClick={onClose}
              aria-label={t("common.closePanel")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
