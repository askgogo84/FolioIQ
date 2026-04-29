// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UploadHero from "@/components/upload-hero";
import Features from "@/components/features";
import Header from "@/components/header";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <UploadHero />
      <Features />

      {/* Simple Footer */}
      <footer className="border-t border-border py-8 text-center text-text-secondary text-sm">
        <p>Built for Indian investors. Your data stays encrypted and private.</p>
      </footer>
    </main>
  );
}
