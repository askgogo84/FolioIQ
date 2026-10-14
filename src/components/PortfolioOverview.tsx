import PortfolioWorkspace from "./portfolio/PortfolioWorkspace";
export { money } from "@/lib/portfolio/format";
export default function PortfolioOverview({
  holdingsOnly = false,
}: {
  holdingsOnly?: boolean;
}) {
  return <PortfolioWorkspace view={holdingsOnly ? "holdings" : "overview"} />;
}
