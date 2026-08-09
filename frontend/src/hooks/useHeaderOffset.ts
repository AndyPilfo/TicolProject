import { useEffect, useState } from "react";

export function useHeaderOffset(selector = "header", fallback = 88) {
  const [offset, setOffset] = useState(fallback);

  useEffect(() => {
    let raf = 0;

    function compute() {
      const el = document.querySelector(selector) as HTMLElement | null;
      setOffset(el?.offsetHeight ?? fallback);
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    }

    schedule();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
    };
  }, [fallback, selector]);

  return offset;
}

