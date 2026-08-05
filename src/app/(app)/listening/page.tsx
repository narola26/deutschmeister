import ComingSoon from "@/components/coming-soon";
import { Headphones } from "lucide-react";

export default function ListeningPage() {
  return (
    <ComingSoon
      title="Listening comprehension"
      description="AI speaks German sentences and you type what you hear. Difficulty scales from slow and clear to natural speed."
      icon={Headphones}
    />
  );
}
