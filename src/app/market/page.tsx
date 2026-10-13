import Unavailable from "@/components/Unavailable";
export default function Page() {
  return (
    <Unavailable
      title="Market overview"
      reason="An independently validated market quote feed is not connected."
    />
  );
}
