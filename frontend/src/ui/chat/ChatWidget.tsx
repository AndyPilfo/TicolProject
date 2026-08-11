import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent } from "react";
import { MessageSquareText } from "lucide-react";
import { useAuth } from "../../state/auth";
import { useI18n } from "../../state/i18n";
import { useTheme } from "../../state/theme";
import { useUi } from "../../state/ui";
import { clsx } from "../../utils/clsx";
import { ChatPanel } from "./ChatPanel";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ButtonPosition = {
  left: number;
  top: number;
};

const STORAGE_KEY = "chatbotButtonPosition";
const DRAG_THRESHOLD = 8;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  dragging: boolean;
};

function isCorner(value: string | null): value is Corner {
  return value === "top-left" || value === "top-right" || value === "bottom-left" || value === "bottom-right";
}

function readStoredCorner(): Corner {
  if (typeof window === "undefined") return "bottom-right";
  return isCorner(localStorage.getItem(STORAGE_KEY)) ? (localStorage.getItem(STORAGE_KEY) as Corner) : "bottom-right";
}

function getNavbarHeight() {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--navbar-height").trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSafeMargin() {
  if (typeof window === "undefined") return 16;
  if (window.matchMedia("(min-width: 1024px)").matches) return 36;
  return window.matchMedia("(min-width: 768px)").matches ? 28 : 20;
}

function getEstimatedButtonSize() {
  if (typeof window === "undefined") return 56;
  if (window.matchMedia("(min-width: 1024px)").matches) return 64;
  return window.matchMedia("(min-width: 768px)").matches ? 60 : 56;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getBounds(buttonSize: number) {
  const margin = getSafeMargin();
  const navbarHeight = getNavbarHeight();
  const minX = margin;
  const minY = navbarHeight + margin;
  const maxX = Math.max(minX, window.innerWidth - margin - buttonSize);
  const maxY = Math.max(minY, window.innerHeight - margin - buttonSize);
  return { minX, minY, maxX, maxY };
}

function getCornerPosition(corner: Corner, buttonSize: number): ButtonPosition {
  const { minX, minY, maxX, maxY } = getBounds(buttonSize);
  return {
    left: corner.includes("left") ? minX : maxX,
    top: corner.includes("top") ? minY : maxY
  };
}

function getNearestCorner(left: number, top: number, buttonSize: number): Corner {
  const { minX, minY, maxX, maxY } = getBounds(buttonSize);
  const centerX = left + buttonSize / 2;
  const centerY = top + buttonSize / 2;

  const options: Array<{ corner: Corner; x: number; y: number }> = [
    { corner: "top-left", x: minX + buttonSize / 2, y: minY + buttonSize / 2 },
    { corner: "top-right", x: maxX + buttonSize / 2, y: minY + buttonSize / 2 },
    { corner: "bottom-left", x: minX + buttonSize / 2, y: maxY + buttonSize / 2 },
    { corner: "bottom-right", x: maxX + buttonSize / 2, y: maxY + buttonSize / 2 }
  ];

  let bestCorner = options[0].corner;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const option of options) {
    const distance = Math.hypot(centerX - option.x, centerY - option.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCorner = option.corner;
    }
  }

  return bestCorner;
}

export function ChatWidget() {
  const { token } = useAuth();
  const { chatWidgetOpen, openAuthModal, closeChatWidget, openChatWidget } = useUi();
  const { t } = useI18n();
  const { theme } = useTheme();
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const dragStateRef = useRef<DragState | null>(null);
  const previousBodyUserSelectRef = useRef<string | null>(null);
  const cancelActiveDragRef = useRef<() => void>(() => undefined);
  const [corner, setCorner] = useState<Corner>(() => readStoredCorner());
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>(() => getCornerPosition(readStoredCorner(), getEstimatedButtonSize()));
  const [isDragging, setIsDragging] = useState(false);
  const cornerRef = useRef(corner);
  const buttonPositionRef = useRef(buttonPosition);

  function updateButtonPosition(nextPosition: ButtonPosition) {
    buttonPositionRef.current = nextPosition;
    setButtonPosition(nextPosition);
  }

  useEffect(() => {
    if (!token) {
      closeChatWidget();
    }
  }, [closeChatWidget, token]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeChatWidget();
      }
    }

    if (!chatWidgetOpen) return undefined;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatWidgetOpen, closeChatWidget]);

  useEffect(() => {
    if (chatWidgetOpen) {
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else if (wasOpenRef.current) {
      window.requestAnimationFrame(() => floatingButtonRef.current?.focus());
    }
    wasOpenRef.current = chatWidgetOpen;
  }, [chatWidgetOpen]);

  useEffect(() => {
    let animationFrame = 0;

    const updatePosition = () => {
      if (dragStateRef.current) return;
      const size = floatingButtonRef.current?.offsetWidth || getEstimatedButtonSize();
      updateButtonPosition(getCornerPosition(cornerRef.current, size));
    };

    const schedulePositionUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updatePosition);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedulePositionUpdate);
    if (floatingButtonRef.current) {
      resizeObserver?.observe(floatingButtonRef.current);
    }

    schedulePositionUpdate();
    window.addEventListener("resize", schedulePositionUpdate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", schedulePositionUpdate);
    };
  }, []);

  useEffect(() => {
    cornerRef.current = corner;
    const size = floatingButtonRef.current?.offsetWidth || getEstimatedButtonSize();
    updateButtonPosition(getCornerPosition(corner, size));
  }, [corner]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, corner);
  }, [corner]);

  useEffect(() => {
    const handleInterruption = () => cancelActiveDragRef.current();
    const handleVisibilityChange = () => {
      if (document.hidden) handleInterruption();
    };

    window.addEventListener("blur", handleInterruption);
    window.addEventListener("pagehide", handleInterruption);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleInterruption);
      window.removeEventListener("pagehide", handleInterruption);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      const dragState = dragStateRef.current;
      const button = floatingButtonRef.current;
      dragStateRef.current = null;
      if (dragState && button?.hasPointerCapture(dragState.pointerId)) {
        try {
          button.releasePointerCapture(dragState.pointerId);
        } catch {
          // Pointer capture may already have been released by the browser.
        }
      }
      if (previousBodyUserSelectRef.current !== null) {
        document.body.style.userSelect = previousBodyUserSelectRef.current;
        previousBodyUserSelectRef.current = null;
      }
    };
  }, []);

  function snapToCorner(nextCorner: Corner) {
    const size = floatingButtonRef.current?.offsetWidth || getEstimatedButtonSize();
    cornerRef.current = nextCorner;
    setCorner(nextCorner);
    updateButtonPosition(getCornerPosition(nextCorner, size));
  }

  function handleToggle() {
    if (!token) {
      openAuthModal({ reason: t("auth.reasonDefault"), returnTo: "/chatbot" });
      return;
    }

    if (chatWidgetOpen) {
      closeChatWidget();
      return;
    }

    openChatWidget();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (chatWidgetOpen) return;
    if (event.button !== 0) return;
    if (!event.isPrimary || dragStateRef.current) return;

    const button = floatingButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      dragging: false
    };

    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // Pointer Events normally guarantee capture here. Cancellation and blur
      // handlers still return the component to a neutral state if capture fails.
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (!dragState.dragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    if (!dragState.dragging) {
      dragState.dragging = true;
      previousBodyUserSelectRef.current = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      event.currentTarget.style.cursor = "grabbing";
      setIsDragging(true);
    }

    event.preventDefault();
    const size = event.currentTarget.offsetWidth || getEstimatedButtonSize();
    const { minX, minY, maxX, maxY } = getBounds(size);
    updateButtonPosition({
      left: clamp(dragState.startLeft + deltaX, minX, maxX),
      top: clamp(dragState.startTop + deltaY, minY, maxY)
    });
  }

  function finishPointerInteraction(pointerId: number, cancelled: boolean) {
    const dragState = dragStateRef.current;
    if (!dragState || pointerId !== dragState.pointerId) return null;

    const button = floatingButtonRef.current;
    const wasDragging = dragState.dragging;

    // Clear the active interaction before releasing capture. A synchronous
    // lostpointercapture event must see the neutral state and do nothing.
    dragStateRef.current = null;
    setIsDragging(false);

    if (previousBodyUserSelectRef.current !== null) {
      document.body.style.userSelect = previousBodyUserSelectRef.current;
      previousBodyUserSelectRef.current = null;
    }

    if (button) {
      button.style.cursor = "grab";
      if (button.hasPointerCapture(pointerId)) {
        try {
          button.releasePointerCapture(pointerId);
        } catch {
          // Pointer capture may already have been released by the browser.
        }
      }

      window.requestAnimationFrame(() => {
        if (!dragStateRef.current && button.isConnected) {
          button.style.removeProperty("cursor");
        }
      });
    }

    if (wasDragging) {
      if (cancelled) {
        snapToCorner(cornerRef.current);
      } else {
        const size = button?.offsetWidth || getEstimatedButtonSize();
        const position = buttonPositionRef.current;
        snapToCorner(getNearestCorner(position.left, position.top, size));
      }
    }

    return wasDragging;
  }

  function cancelActiveDrag() {
    const dragState = dragStateRef.current;
    if (dragState) finishPointerInteraction(dragState.pointerId, true);
  }

  cancelActiveDragRef.current = cancelActiveDrag;

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const wasDragging = finishPointerInteraction(event.pointerId, false);
    if (wasDragging === null) return;

    if (wasDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Pointer clicks are resolved here. The following compatibility click is
    // intentionally ignored, so no suppression flag can leak to a later click.
    handleToggle();
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    finishPointerInteraction(event.pointerId, true);
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLButtonElement>) {
    const dragState = dragStateRef.current;
    if (dragState && event.pointerId === dragState.pointerId) {
      finishPointerInteraction(event.pointerId, true);
    }
  }

  function handleButtonClick(event: MouseEvent<HTMLButtonElement>) {
    // Mouse and touch activation is handled exactly once in pointerup. A click
    // with detail === 0 comes from keyboard/assistive/programmatic activation.
    if (event.detail === 0) handleToggle();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.currentTarget === event.target) {
      closeChatWidget();
    }
  }

  const buttonStyle = {
    left: `${buttonPosition.left}px`,
    top: `${buttonPosition.top}px`
  };

  return (
    <>
      <button
        type="button"
        ref={floatingButtonRef}
        className={clsx(
          "fixed z-[55] inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_0_0_1px_rgba(250,120,1,0.18),0_12px_24px_rgba(250,120,1,0.32)] transition-[left,top,transform,box-shadow,background-color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brandOrange/35 select-none touch-none md:h-[3.75rem] md:w-[3.75rem] md:shadow-[0_0_0_1px_rgba(250,120,1,0.16),0_14px_28px_rgba(250,120,1,0.34)] lg:h-16 lg:w-16",
          theme === "dark"
            ? "bg-brandOrange shadow-[0_0_0_1px_rgba(0,74,173,0.2),0_12px_24px_rgba(0,74,173,0.42)] hover:bg-[#e66c01] hover:shadow-[0_0_0_1px_rgba(0,74,173,0.28),0_16px_32px_rgba(0,74,173,0.54)] focus-visible:ring-brandBlue/35"
            : "bg-brandBlue shadow-[0_0_0_1px_rgba(250,120,1,0.18),0_12px_24px_rgba(250,120,1,0.32)] hover:bg-[#0a57c3] hover:shadow-[0_0_0_1px_rgba(250,120,1,0.26),0_16px_32px_rgba(250,120,1,0.44)] focus-visible:ring-brandOrange/35",
          isDragging ? "scale-[0.96] cursor-grabbing" : "cursor-grab hover:scale-[1.03]",
          chatWidgetOpen && "opacity-0 pointer-events-none"
        )}
        style={buttonStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onClick={handleButtonClick}
        aria-label={t("chat.openAssistantButton")}
        title={t("chat.openAssistantButton")}
      >
        <MessageSquareText className="h-6 w-6 md:h-[1.625rem] md:w-[1.625rem] lg:h-7 lg:w-7" />
      </button>

      <div
        className={clsx(
          "fixed inset-0 z-[56] transition-opacity duration-200",
          chatWidgetOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ visibility: chatWidgetOpen ? "visible" : "hidden" }}
        aria-hidden={!chatWidgetOpen}
      >
        <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onMouseDown={handleBackdropClick} />

        <div className="absolute inset-0 flex justify-end p-2 sm:p-4">
          <div
            className={clsx(
              "h-full w-full overflow-hidden rounded-[28px] transition-[transform,opacity] duration-200 sm:w-[72vw] sm:rounded-[32px] lg:w-[48vw] xl:w-[42rem]",
              chatWidgetOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            )}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ChatPanel onClose={closeChatWidget} closeButtonRef={closeButtonRef} />
          </div>
        </div>
      </div>
    </>
  );
}
