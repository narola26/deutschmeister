// ============================================================
// Speech, and being honest when there is none.
//
// A learner clicking a speaker icon that does nothing, with no
// explanation, concludes the app is broken. Many machines have no
// German voice installed at all, so the app has to detect that and
// say so rather than failing silently.
// ============================================================

export type VoiceState = "ready" | "none" | "unsupported";

export function germanVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("de"));
}

export function voiceState(): VoiceState {
  if (typeof window === "undefined" || !window.speechSynthesis) return "unsupported";
  return germanVoices().length > 0 ? "ready" : "none";
}

/**
 * Voices load asynchronously in most browsers, so the first call to
 * getVoices() often returns an empty list. Wait for them once.
 */
export function onVoicesReady(cb: (state: VoiceState) => void): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    cb("unsupported");
    return () => {};
  }
  const report = () => cb(voiceState());
  report();
  window.speechSynthesis.addEventListener("voiceschanged", report);
  return () =>
    window.speechSynthesis.removeEventListener("voiceschanged", report);
}

export function speak(text: string, opts: { slow?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  const voices = germanVoices();
  if (voices.length === 0) return false;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voices[0];
  u.lang = voices[0].lang;
  u.rate = opts.slow ? 0.6 : 0.85;
  window.speechSynthesis.speak(u);
  return true;
}
