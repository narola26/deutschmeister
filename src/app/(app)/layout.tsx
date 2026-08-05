"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Brain,
  MessageCircle,
  Mic,
  Headphones,
  FileText,
  PenTool,
  Globe,
  BarChart3,
  ClipboardCheck,
  Zap,
  LogOut,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lessons", label: "Daily lesson", icon: BookOpen },
  { href: "/vocabulary", label: "Vocabulary", icon: Zap },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/grammar", label: "Grammar decoder", icon: FileText },
  { href: "/conversation", label: "Conversation", icon: MessageCircle },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/listening", label: "Listening", icon: Headphones },
  { href: "/reading", label: "Reading", icon: FileText },
  { href: "/writing", label: "Writing", icon: PenTool },
  { href: "/immersion", label: "Immersion", icon: Globe },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/homework", label: "Homework", icon: ClipboardCheck },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(!!data.user));
  }, [pathname]);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">DeutschMeister</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          {signedIn ? (
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              Log out
            </button>
          ) : (
            <Link
              href="/signup"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary-light w-full transition-colors"
            >
              <UserPlus className="w-4.5 h-4.5" />
              Save my progress
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 px-4 flex items-center border-b border-border lg:hidden bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-foreground">DeutschMeister</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
