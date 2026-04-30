"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Upload, BarChart3, User, LogOut } from "lucide-react";

// Inline Button component
function Button({ children, onClick, className = "" }: any) {
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${className}`}>
      {children}
    </button>
  );
}

// Inline supabase
const supabase = {
  auth: {
    getSession: async () => {
      const session = typeof window !== "undefined" ? localStorage.getItem("sb-session") : null;
      return { data: { session: session ? JSON.parse(session) : null } };
    },
    signOut: async () => {
      if (typeof window !== "undefined") localStorage.removeItem("sb-session");
    }
  }
};

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!user) return null;

  const navItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/dashboard", label: "Analysis", icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/profile" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FolioIQ</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    className={`gap-2 ${isActive ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            <Button onClick={handleLogout} className="text-slate-400 hover:text-red-400 ml-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
