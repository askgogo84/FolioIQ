"use client";

export const demoPortfolio = {
  totalValue: 5530000,
  investedAmount: 3911171,
  currentReturns: 1618829,
  returnsPercent: 41.4,
  xirr: 12.8,
  healthScore: 68,
  funds: [
    { name: "Mirae Asset Large Cap Fund", category: "Equity - Large Cap", value: 850000, invested: 620000, returns: 230000, returnsPercent: 37.1, sip: 10000, rating: 5, risk: "Moderate" },
    { name: "Axis Midcap Fund", category: "Equity - Mid Cap", value: 720000, invested: 480000, returns: 240000, returnsPercent: 50.0, sip: 8000, rating: 4, risk: "High" },
    { name: "SBI Small Cap Fund", category: "Equity - Small Cap", value: 580000, invested: 350000, returns: 230000, returnsPercent: 65.7, sip: 5000, rating: 4, risk: "Very High" },
    { name: "ICICI Pru Balanced Advantage", category: "Hybrid", value: 950000, invested: 780000, returns: 170000, returnsPercent: 21.8, sip: 15000, rating: 5, risk: "Moderate" },
    { name: "HDFC Corporate Bond Fund", category: "Debt", value: 680000, invested: 650000, returns: 30000, returnsPercent: 4.6, sip: 12000, rating: 4, risk: "Low" },
    { name: "Nippon India Tax Saver", category: "ELSS", value: 450000, invested: 320000, returns: 130000, returnsPercent: 40.6, sip: 6000, rating: 3, risk: "High" },
    { name: "UTI Nifty 50 Index Fund", category: "Index", value: 520000, invested: 410000, returns: 110000, returnsPercent: 26.8, sip: 7000, rating: 4, risk: "Moderate" },
    { name: "Franklin India Feeder", category: "International", value: 380000, invested: 301171, returns: 78829, returnsPercent: 26.2, sip: 5000, rating: 3, risk: "High" },
  ],
  allocation: { equity: 62, debt: 18, hybrid: 12, international: 8 },
  monthlySIP: 67000,
  totalSIPs: 8,
  goals: [
    { name: "Retirement Corpus", target: 50000000, current: 3200000, progress: 6.4, years: 20 },
    { name: "Child Education", target: 2000000, current: 850000, progress: 42.5, years: 8 },
    { name: "Home Purchase", target: 1500000, current: 680000, progress: 45.3, years: 5 },
    { name: "Emergency Fund", target: 600000, current: 450000, progress: 75.0, years: 2 },
  ],
  taxHarvesting: {
    potentialSavings: 28400,
    stclAvailable: 45000,
    ltclAvailable: 120000,
    recommendedActions: 3
  },
  alerts: [
    { type: "warning", title: "Concentration Risk", message: "35% in Large Cap. Consider diversifying.", action: "Rebalance" },
    { type: "info", title: "SIP Step-up", message: "Increase SIP by 10% to reach goals faster.", action: "Calculate" },
    { type: "success", title: "Tax Harvest", message: "Rs 28,400 tax savings available this FY.", action: "Harvest" },
  ]
};

export const demoTransactions = [
  { date: "2026-04-15", type: "SIP", fund: "Mirae Asset Large Cap", amount: 10000, units: 32.45, nav: 308.17 },
  { date: "2026-04-10", type: "SIP", fund: "Axis Midcap Fund", amount: 8000, units: 28.12, nav: 284.50 },
  { date: "2026-04-05", type: "SIP", fund: "SBI Small Cap", amount: 5000, units: 18.90, nav: 264.55 },
  { date: "2026-03-28", type: "Lumpsum", fund: "ICICI Pru Balanced", amount: 50000, units: 152.30, nav: 328.30 },
  { date: "2026-03-15", type: "SIP", fund: "HDFC Corporate Bond", amount: 12000, units: 412.80, nav: 29.07 },
];

export const demoComparison = [
  { name: "Mirae Asset Large Cap", returns1Y: 18.5, returns3Y: 14.2, returns5Y: 12.8, risk: "Moderate", aum: 28500 },
  { name: "Axis Bluechip", returns1Y: 16.2, returns3Y: 13.1, returns5Y: 11.5, risk: "Moderate", aum: 22100 },
  { name: "Canara Robeco Bluechip", returns1Y: 19.1, returns3Y: 15.3, returns5Y: 13.2, risk: "Moderate", aum: 15800 },
];
