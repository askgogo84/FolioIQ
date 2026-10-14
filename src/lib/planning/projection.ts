export function projectSip(
  monthly: number,
  years: number,
  annualPercent: number,
  stepUpPercent: number,
) {
  if (
    ![monthly, years, annualPercent, stepUpPercent].every(Number.isFinite) ||
    monthly < 0 ||
    monthly > 1e9 ||
    !Number.isInteger(years) ||
    years < 1 ||
    years > 50 ||
    annualPercent <= -100 ||
    annualPercent > 100 ||
    stepUpPercent < 0 ||
    stepUpPercent > 100
  )
    throw new Error("Scenario inputs are outside supported limits.");
  const monthlyRate = Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
  let value = 0,
    invested = 0,
    contribution = monthly;
  const points: { year: number; value: number; invested: number }[] = [];
  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      value = value * (1 + monthlyRate) + contribution;
      invested += contribution;
      if (!Number.isFinite(value) || value > 1e15 || invested > 1e15)
        throw new Error("Scenario exceeds supported numerical limits.");
    }
    points.push({ year, value, invested });
    contribution *= 1 + stepUpPercent / 100;
  }
  return {
    value,
    invested,
    difference: value - invested,
    points,
    method:
      "End-of-month contributions; annual effective return converted to an equivalent monthly rate; annual contribution step-up after each 12 months. No tax, inflation or fees.",
  };
}
