// components/header.tsx
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { TrendingUp, Shield, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">FolioIQ</span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Shield className="w-4 h-4" /> Bank-grade Security
            </span>
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Zap className="w-4 h-4" /> AI-Powered
            </span>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="btn-secondary text-sm">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary text-sm">Get Started</button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </header>
  );
}
