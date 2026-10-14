import type { PortfolioAnalysis } from "./generate";
import type { GuideTopic } from "@/lib/providers/guide-router";
import type { LedgerAssessment } from "@/lib/portfolio/ledger";
import { money } from "@/lib/portfolio/format";
export function guideAnswer(
  topic: GuideTopic,
  a: PortfolioAnalysis,
  ledger: LedgerAssessment | null,
) {
  const answers: Record<GuideTopic, { text: string; href: string }> = {
    value: {
      text:
        a.summary.totalCurrent === null
          ? "A complete total is unavailable. Known reported value: " +
            money(a.summary.knownCurrent) +
            ". This subtotal does not represent the whole portfolio."
          : "Reported / NAV-marked value: " +
            money(a.summary.totalCurrent) +
            ". This uses imported units; subsequent account transactions are not verified.",
      href: "/portfolio",
    },
    coverage: {
      text: `${a.quality.valued}/${a.summary.positions} positions have values; ${a.quality.costed}/${a.summary.positions} have source cost; ${a.nav.priced}/${a.summary.positions} have positive dated NAVs. Field presence is not independent verification.`,
      href: "/intelligence",
    },
    allocation: {
      text: a.concentration.amc.largest
        ? `${a.concentration.amc.largest.label} is the largest known AMC group at ${a.concentration.amc.largest.percent.toFixed(1)}% of known valued positions. Missing values are excluded. This is not security-level overlap or a recommendation.`
        : "There is insufficient known AMC/value evidence to describe concentration.",
      href: "/dashboard",
    },
    returns: {
      text:
        ledger?.return.rate != null
          ? `Annualized statement-period cash-flow XIRR: ${(ledger.return.rate * 100).toFixed(2)}%, from ${ledger.from} to ${ledger.to}. ${ledger.scope}`
          : "Statement XIRR needs a dated period, zero opening units, supported cash flows and reconciled closing units. Review the ledger for specific missing evidence. Continuous performance is unavailable.",
      href: "/transactions",
    },
    planning: {
      text: "Your saved goals, preferences, manual schedules and allocation targets are self-reported. They do not verify a bank mandate, risk score, suitability or trade. Contribution-only goal illustrations assume zero investment returns.",
      href: "/goals",
    },
    advice: {
      text: "FolioKey cannot recommend a best fund or provide tax or trading advice from this evidence. Reviewed suitability, licensed benchmark/category data, costs and fund disclosures are still required. No investment action has been generated.",
      href: "/intelligence",
    },
    unknown: {
      text: "Please choose a question from the portfolio guide. There is not enough evidence to answer this request.",
      href: "/chat",
    },
  };
  return {
    ...answers[topic],
    asOf: a.asOf,
    method: "Deterministic evidence template; AI matched a topic only",
  };
}
