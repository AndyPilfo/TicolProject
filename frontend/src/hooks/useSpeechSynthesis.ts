import { useCallback, useEffect, useState } from "react";

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (!supported) return;
    const onEnd = () => setSpeaking(false);
    window.speechSynthesis.addEventListener("end", onEnd);
    window.speechSynthesis.addEventListener("pause", onEnd);
    window.speechSynthesis.addEventListener("voiceschanged", () => undefined);
    return () => {
      window.speechSynthesis.removeEventListener("end", onEnd);
      window.speechSynthesis.removeEventListener("pause", onEnd);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, language: "es" | "en" = "es") => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-US" : "es-CR";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  return { supported, speaking, speak, stop };
}
