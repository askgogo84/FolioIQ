export function performanceReadiness(hasPositions: boolean) {
  return {
    available: false as const,
    checks: [
      {
        id: "snapshot",
        label: "Portfolio snapshot",
        ready: hasPositions,
        detail: hasPositions
          ? "Positions are available for snapshot review."
          : "Import a statement to begin.",
      },
      {
        id: "ledger",
        label: "Reconciled transaction ledger",
        ready: false,
        detail: "Statement records do not establish complete dated cash flows.",
      },
      {
        id: "history",
        label: "Historical units and valuations",
        ready: false,
        detail:
          "Dated NAV history and reconciled units are needed for period charts.",
      },
      {
        id: "returns",
        label: "Verified return calculation",
        ready: false,
        detail:
          "XIRR needs complete flows, a terminal value and convergence checks.",
      },
    ],
    blocked: [
      "Period returns",
      "Portfolio XIRR",
      "Historical performance chart",
    ],
  };
}
