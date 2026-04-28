export const FOLIOIQ_STORAGE_KEYS = {
  portfolio: "folioiq_h",
  legacyPortfolio: "folioiq_portfolio",
  riskProfile: "folioiq_risk_profile",
  onboarding: "folioiq_onboarding_profile",
} as const

export const TAX_RULES = {
  ltcgExemption: 125000,
  equityLtcgRate: 0.125,
  equityStcgRate: 0.2,
  slabFallbackRate: 0.3,
  cessRate: 0.04,
  equityLongTermDays: 365,
  hybridLongTermDays: 730,
} as const

export const MFAPI_BASE_URL = "https://api.mfapi.in"

export const BENCHMARK_SCHEMES = {
  nifty50: "120716",
} as const
