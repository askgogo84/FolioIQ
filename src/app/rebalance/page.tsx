import FeatureReadiness from "@/components/portfolio/FeatureReadiness";
export default function Page() {
  return (
    <FeatureReadiness
      title="Balance begins with context."
      reason="A rebalance proposal needs your confirmed targets, horizon, liquidity needs and switching costs. No default allocation or trade is assigned to you."
      requirements={[
        "Your confirmed risk profile and goals",
        "Transaction lots, taxes and exit loads",
        "Reviewed target allocation and constraints",
      ]}
    />
  );
}
