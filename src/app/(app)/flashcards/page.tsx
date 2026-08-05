import ComingSoon from "@/components/coming-soon";
import { Brain } from "lucide-react";

export default function FlashcardsPage() {
  return (
    <ComingSoon
      title="Smart flashcards"
      description="Spaced repetition system that ensures you remember every word. Review daily, and the algorithm adapts to your memory patterns."
      icon={Brain}
    />
  );
}
