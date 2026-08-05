import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
        <Construction className="w-4 h-4" />
        Coming soon — we&apos;re building this next
      </div>
    </div>
  );
}
