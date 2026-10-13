import Unavailable from "@/components/Unavailable";
export default function Page() {
  return (
    <Unavailable
      title="Imported SIP Amounts"
      reason="Imported transactions can show historical SIP installments. They do not prove an active mandate or future payment schedule."
    />
  );
}
