import ComingSoon from "@/components/coming-soon";
import { ClipboardCheck } from "lucide-react";

export default function HomeworkPage() {
  return (
    <ComingSoon
      title="Homework"
      description="Daily practice tasks assigned by AI based on today's lesson. Mix of writing, translation, and fill-in-the-blank exercises."
      icon={ClipboardCheck}
    />
  );
}
