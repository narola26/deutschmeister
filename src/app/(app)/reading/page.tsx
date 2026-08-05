import ComingSoon from "@/components/coming-soon";
import { FileText } from "lucide-react";

export default function ReadingPage() {
  return (
    <ComingSoon
      title="Reading practice"
      description="Level-appropriate German texts. Tap any word for instant translation. Comprehension questions after each reading."
      icon={FileText}
    />
  );
}
