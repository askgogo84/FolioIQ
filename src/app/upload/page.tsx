import ImportPortfolio from "@/components/ImportPortfolio";
export default function Page() {
  return (
    <ImportPortfolio
      connect={false}
      configured={Boolean(process.env.FOLIOKEY_CAS_PARSER_API_KEY)}
    />
  );
}
