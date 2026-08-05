import ComingSoon from "@/components/coming-soon";
import { Globe } from "lucide-react";

export default function ImmersionPage() {
  return (
    <ComingSoon
      title="Immersion engine"
      description="Translate English paragraphs to German, practice with real German documents, and work through grammar exercises in context."
      icon={Globe}
    />
  );
}
