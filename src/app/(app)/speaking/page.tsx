import ComingSoon from "@/components/coming-soon";
import { Mic } from "lucide-react";

export default function SpeakingPage() {
  return (
    <ComingSoon
      title="Speaking practice"
      description="AI prompts you, you speak German. Browser transcribes your speech and AI evaluates your pronunciation and grammar."
      icon={Mic}
    />
  );
}
