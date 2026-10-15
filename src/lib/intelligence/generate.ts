import { portfolioSummary } from "./summary";
import { dataQuality } from "./data-quality";
import { allocation } from "./allocation";
import { concentration } from "./concentration";
import { navCoverage } from "./nav-coverage";
import { performanceReadiness } from "./readiness";
import type { Insight, Position } from "./types";
export function analyzePortfolio(
  rows: Position[],
  today = new Date().toISOString().slice(0, 10),
) {
  const summary = portfolioSummary(rows),
    quality = dataQuality(rows, today),
    category = allocation(rows, "category"),
    amc = allocation(rows, "amc"),
    nav = navCoverage(rows, today);
  const findings: Insight[] = [];
  if (!rows.length)
    findings.push({
      id: "empty",
      kind: "readiness",
      title: "Your portfolio story starts here",
      detail:
        "Import a statement to see holdings and evidence-based observations.",
      evidence: "No positions available",
      href: "/upload",
      action: "Import a statement",
    });
  if (
    rows.length &&
    (quality.valued < rows.length ||
      quality.costed < rows.length ||
      quality.dated < rows.length)
  )
    findings.push({
      id: "coverage",
      kind: "coverage",
      title: "Complete the picture",
      detail: `${rows.length - quality.valued} positions lack valid value, ${rows.length - quality.costed} lack cost and ${rows.length - quality.dated} lack a valid valuation date.`,
      evidence: "Field coverage, not independent verification",
      href: "/portfolio",
      action: "Review holdings",
    });
  if (quality.mixedDates)
    findings.push({
      id: "dates",
      kind: "coverage",
      title: "Different dates, one snapshot",
      detail:
        "Holdings have different valuation dates. Combined values are not a same-day valuation.",
      evidence: `${quality.oldestDate} to ${quality.newestDate}`,
      href: "/portfolio",
      action: "Inspect dates",
    });
  if (nav.older || nav.undatedOrMissing)
    findings.push({
      id: "nav",
      kind: "coverage",
      title: "Review NAV coverage",
      detail: `${nav.older} dated NAVs are over 7 days old; ${nav.undatedOrMissing} positions lack a positive dated NAV.`,
      evidence: nav.freshnessPolicy,
      href: "/dashboard",
      action: "Review NAV status",
    });
  for (const [label, a] of [
    ["AMC", amc],
    ["category", category],
  ] as const) {
    const largest = concentration(a.slices).largest;
    if (largest)
      findings.push({
        id: label,
        kind: "observation",
        title: `Largest reported ${label}`,
        detail: `${largest.label} represents ${largest.percent.toFixed(1)}% of ${a.partial ? "known valued positions" : "snapshot value"}. This is exposure, not a recommendation to reduce it.`,
        evidence: `${a.valued}/${rows.length} positions valued; reported classifications`,
        href: "/portfolio",
        action: "Explore holdings",
      });
  }
  if (rows.length)
    findings.push({
      id: "performance",
      kind: "readiness",
      title: "History before returns",
      detail:
        "The source-statement ledger checks supported cash flows separately. Continuous performance and lifetime returns still need reconciled history and valuations.",
      evidence: "No estimated XIRR or performance series",
      href: "/transactions",
      action: "Review statement records",
    });
  return {
    summary,
    quality,
    allocation: { category, amc },
    concentration: {
      category: concentration(category.slices),
      amc: concentration(amc.slices),
    },
    nav,
    performance: performanceReadiness(rows.length > 0),
    findings,
    asOf: today,
    method: "snapshot-evidence-v1",
  };
}
export type PortfolioAnalysis = ReturnType<typeof analyzePortfolio>;
