import ImportPortfolio from "@/components/ImportPortfolio";
import { casProviderKey } from "@/lib/server/cas-provider";
export default function Page() {
  return (
    <ImportPortfolio connect={true} configured={Boolean(casProviderKey())} />
  );
}
