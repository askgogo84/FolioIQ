import Unavailable from "@/components/Unavailable";
export default function Page() {
  return (
    <Unavailable
      title="Holding comparison"
      reason="Comparison is paused until missing cost and valuation fields can be displayed without substituting zero. Your existing holdings remain available in the portfolio view."
    />
  );
}
