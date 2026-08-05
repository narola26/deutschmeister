import ComingSoon from "@/components/coming-soon";
import { BookOpen } from "lucide-react";

export default function LessonsPage() {
  return (
    <ComingSoon
      title="Daily lessons"
      description="30-minute structured lessons mixing grammar, vocabulary, and practice. AI generates content matched to your current level."
      icon={BookOpen}
    />
  );
}
