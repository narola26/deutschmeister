import ComingSoon from "@/components/coming-soon";
import { MessageCircle } from "lucide-react";

export default function ConversationPage() {
  return (
    <ComingSoon
      title="Real conversation mode"
      description="Practice speaking German with your AI tutor in real scenarios — job interviews, doctor visits, shopping, and everyday conversations."
      icon={MessageCircle}
    />
  );
}
