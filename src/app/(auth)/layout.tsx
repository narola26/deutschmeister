import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <GraduationCap className="w-8 h-8 text-primary" />
        <span className="text-xl font-semibold text-foreground">Sprachstufe</span>
      </Link>
      {children}
    </div>
  );
}
