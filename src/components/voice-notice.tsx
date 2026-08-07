"use client";

import { useEffect, useState } from "react";
import { VolumeX } from "lucide-react";
import { onVoicesReady, type VoiceState } from "@/lib/speech";

/**
 * Shown once, near the top of any page with speaker buttons, when the
 * machine has no German voice. Silence with no explanation reads as a
 * broken app.
 */
export default function VoiceNotice() {
  const [state, setState] = useState<VoiceState>("ready");

  useEffect(() => onVoicesReady(setState), []);

  if (state === "ready") return null;

  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-border bg-muted mb-5">
      <VolumeX
        aria-hidden="true"
        className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"
      />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {state === "unsupported" ? (
          <>This browser cannot speak text aloud, so the audio buttons will stay quiet.</>
        ) : (
          <>
            No German voice is installed on this device, so the audio buttons will stay
            quiet. On Windows, add one under Settings, Time &amp; language, Speech. On a
            phone, install a German voice in your text-to-speech settings. The written
            pronunciation guide works either way.
          </>
        )}
      </p>
    </div>
  );
}
