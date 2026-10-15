export function performanceReadiness(hasPositions: boolean) {
  return {
    available: false as const,
    scope:
      "Snapshot alone; statement-period XIRR has a separate source-ledger assessment.",
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
        detail:
          "A holdings snapshot does not establish cash-flow completeness. The source statement is evaluated separately in the ledger review.",
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
          "Source-statement XIRR is evaluated separately. Lifetime returns need complete flows, terminal values and convergence checks.",
      },
    ],
    blocked: [
      "Continuous period returns",
      "Certified lifetime portfolio XIRR",
      "Historical performance chart",
    ],
  };
}
