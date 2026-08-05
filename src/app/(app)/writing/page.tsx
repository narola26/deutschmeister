import ComingSoon from "@/components/coming-soon";
import { PenTool } from "lucide-react";

export default function WritingPage() {
  return (
    <ComingSoon
      title="Writing practice"
      description="Write paragraphs in German. AI corrects your grammar, suggests better phrasing, and explains every error."
      icon={PenTool}
    />
  );
}
