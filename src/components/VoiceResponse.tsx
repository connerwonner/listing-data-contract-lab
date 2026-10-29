import type { Property } from "../contract/validator";
import { voiceResponse } from "../lib/voice";

export function VoiceResponse({ property }: { property: Property }) {
  const text = voiceResponse(property);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = () => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };
  return (
    <section aria-label="Voice response">
      <h3>Voice response</h3>
      <blockquote>{text}</blockquote>
      {canSpeak && <button type="button" className="btn" onClick={speak}>Read aloud</button>}
    </section>
  );
}
