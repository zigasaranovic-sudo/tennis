import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Top navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-green-600">
                Tenis
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/players"
                  className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                >
                  Find Players
                </Link>
                <Link
                  href="/matches"
                  className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                >
                  Matches
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                >
                  Messages
                </Link>
                <Link
                  href="/courts"
                  className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                >
                  Courts
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/profile"
                className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {user.email?.[0]?.toUpperCase() ?? "P"}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom nav for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {[
            { href: "/", icon: "🏠", label: "Home" },
            { href: "/players", icon: "🔍", label: "Find" },
            { href: "/matches", icon: "🎾", label: "Matches" },
            { href: "/messages", icon: "💬", label: "Messages" },
            { href: "/courts", icon: "🏟️", label: "Courts" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
