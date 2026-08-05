import ComingSoon from "@/components/coming-soon";
import { FileText } from "lucide-react";

export default function GrammarPage() {
  return (
    <ComingSoon
      title="Grammar decoder"
      description="German grammar rules explained clearly with interactive examples. Common mistakes highlighted so you avoid them from the start."
      icon={FileText}
    />
  );
}
