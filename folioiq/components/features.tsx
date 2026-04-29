// components/features.tsx
import { Brain, Calculator, TrendingDown, Bell, FileCheck, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Not just numbers. We tell you exactly which funds to continue, pause, or stop — with clear reasons.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Calculator,
    title: "Real Post-Tax Returns",
    description: "See what you actually keep after STCG, LTCG, and indexation. No more misleading headline returns.",
    color: "bg-success/10 text-success"
  },
  {
    icon: TrendingDown,
    title: "Tax-Loss Harvesting",
    description: "Identify losing funds to sell and offset gains. Save up to ₹1 lakh in taxes every year.",
    color: "bg-warning/10 text-warning"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified when fund managers change, expense ratios hike, or your funds underperform peers.",
    color: "bg-info/10 text-info"
  },
  {
    icon: FileCheck,
    title: "One-Click CAS Upload",
    description: "Upload your Consolidated Account Statement from CAMS or Karvy. We auto-extract all holdings.",
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "AES-256 encryption. Your data never leaves Indian servers. SOC 2 Type II compliant infrastructure.",
    color: "bg-slate-500/10 text-slate-500"
  }
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Everything INDmoney Has, <span className="gradient-text">And More</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Built by investors, for investors. No confusing jargon. Just clear, actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="card p-6 hover:shadow-elevated transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
