import { useEffect, useState } from "react";

/**
 * Returns how much of the footer is overlapping the viewport bottom.
 * Useful for shrinking fixed sidebars so they don't cover the footer.
 */
export function useFooterInset(footerId = "app-footer") {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    let raf = 0;

    function compute() {
      const footer = document.getElementById(footerId);
      if (!footer) {
        setInset(0);
        return;
      }
      const rect = footer.getBoundingClientRect();
      setInset(Math.max(0, window.innerHeight - rect.top));
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [footerId]);

  return inset;
}

