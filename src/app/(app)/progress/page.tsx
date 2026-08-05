import ComingSoon from "@/components/coming-soon";
import { BarChart3 } from "lucide-react";

export default function ProgressPage() {
  return (
    <ComingSoon
      title="Progress evaluator"
      description="Weekly quizzes measure all your skills. AI identifies weak areas and automatically adjusts next week's content."
      icon={BarChart3}
    />
  );
}
