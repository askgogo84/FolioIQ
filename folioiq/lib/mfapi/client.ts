import { FundDetails, NAVData } from '@/types';

const BASE_URL = process.env.MFAPI_BASE_URL || 'https://api.mfapi.in';

export async function searchFunds(query: string): Promise<{schemeCode: number; schemeName: string}[]> {
  const res = await fetch(`${BASE_URL}/mf/search?q=${encodeURIComponent(query)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to search funds');
  return res.json();
}

export async function getFundDetails(schemeCode: string): Promise<FundDetails> {
  const res = await fetch(`${BASE_URL}/mf/${schemeCode}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch fund details');
  const data = await res.json();

  return {
    scheme_code: schemeCode,
    scheme_name: data.meta.scheme_name,
    fund_house: data.meta.fund_house,
    category: data.meta.scheme_category,
    scheme_type: data.meta.scheme_type,
    latest_nav: parseFloat(data.data[0]?.nav || 0),
    nav_date: data.data[0]?.date,
    historical_nav: data.data.map((d: any) => ({
      date: d.date,
      nav: parseFloat(d.nav),
    })),
    returns: {
      '1y': 0,
      '3y': 0,
      '5y': 0,
      inception: 0,
    },
  };
}

export async function getLatestNAV(schemeCode: string): Promise<{nav: number; date: string}> {
  const res = await fetch(`${BASE_URL}/mf/${schemeCode}/latest`, {
    next: { revalidate: 300 }, // 5 min cache
  });
  if (!res.ok) throw new Error('Failed to fetch latest NAV');
  const data = await res.json();
  return {
    nav: parseFloat(data.data[0].nav),
    date: data.data[0].date,
  };
}

export async function getHistoricalNAV(
  schemeCode: string, 
  startDate: string, 
  endDate: string
): Promise<NAVData[]> {
  const res = await fetch(
    `${BASE_URL}/mf/${schemeCode}?startDate=${startDate}&endDate=${endDate}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error('Failed to fetch historical NAV');
  const data = await res.json();
  return data.data.map((d: any) => ({
    date: d.date,
    nav: parseFloat(d.nav),
  }));
}

// Batch fetch NAVs for multiple schemes
export async function getBatchNAVs(schemeCodes: string[]): Promise<Map<string, {nav: number; date: string}>> {
  const results = new Map<string, {nav: number; date: string}>();

  await Promise.all(
    schemeCodes.map(async (code) => {
      try {
        const nav = await getLatestNAV(code);
        results.set(code, nav);
      } catch (e) {
        console.error(`Failed to fetch NAV for ${code}:`, e);
      }
    })
  );

  return results;
}
