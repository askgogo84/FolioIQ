"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, TrendingUp, User, Menu, X, Sparkles, Bell } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/explore", label: "Explore", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

function getLinkClass(isActive) {
  if (isActive) {
    return "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-50 text-emerald-700";
  }
  return "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900";
}

function getIconClass(isActive) {
  if (isActive) {
    return "w-4 h-4 text-emerald-600";
  }
  return "w-4 h-4 text-slate-400";
}

function getMobileLinkClass(isActive) {
  if (isActive) {
    return "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all bg-emerald-50 text-emerald-700";
  }
  return "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-slate-600 hover:bg-slate-50";
}

function getMobileIconClass(isActive) {
  if (isActive) {
    return "w-5 h-5 text-emerald-600";
  }
  return "w-5 h-5 text-slate-400";
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FolioIQ</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={getLinkClass(isActive)}
                  >
                    <Icon className={getIconClass(isActive)} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
                {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={getMobileLinkClass(isActive)}
                  >
                    <Icon className={getMobileIconClass(isActive)} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}