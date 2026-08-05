import ComingSoon from "@/components/coming-soon";
import { Zap } from "lucide-react";

export default function VocabularyPage() {
  return (
    <ComingSoon
      title="Vocabulary builder"
      description="30 new German words every day with translations and example sentences. Each word feeds into your flashcard system automatically."
      icon={Zap}
    />
  );
}
