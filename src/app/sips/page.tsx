import FeatureReadiness from "@/components/portfolio/FeatureReadiness";
export default function Page() {
  return (
    <FeatureReadiness
      title="Investing, with intention."
      reason="Past installments can appear in statement records. They do not confirm an active SIP mandate, the next debit or a missed payment."
      requirements={[
        "Confirmed mandate and payment schedule",
        "Reconciled installments and cancellations",
        "Consent for future schedule updates",
      ]}
    />
  );
}
