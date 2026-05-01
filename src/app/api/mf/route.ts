import { NextResponse } from "next/server";

const MFAPI_BASE = "https://api.mfapi.in";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const schemeCode = searchParams.get("schemeCode");
  const query = searchParams.get("q");

  try {
    if (action === "search" && query) {
      const cacheKey = `search_${query}`;
      let data = getCached(cacheKey);

      if (!data) {
        const res = await fetch(`${MFAPI_BASE}/mf/search?q=${encodeURIComponent(query)}`, {
          headers: { "Accept": "application/json" }
        });
        data = await res.json();
        setCache(cacheKey, data);
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "latest" && schemeCode) {
      const cacheKey = `latest_${schemeCode}`;
      let data = getCached(cacheKey);

      if (!data) {
        const res = await fetch(`${MFAPI_BASE}/mf/${schemeCode}/latest`, {
          headers: { "Accept": "application/json" }
        });
        data = await res.json();
        setCache(cacheKey, data);
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "history" && schemeCode) {
      let url = `${MFAPI_BASE}/mf/${schemeCode}`;
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("MF API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mutual fund data" },
      { status: 500 }
    );
  }
}
