// app/upload/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PortfolioUploader from "@/components/portfolio-uploader";
import DashboardHeader from "@/components/dashboard-header";

export default async function UploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-surface-elevated">
      <DashboardHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PortfolioUploader />
      </div>
    </main>
  );
}
