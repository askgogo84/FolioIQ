"use client";
import { useEffect, useState, useCallback } from "react";
import type { Position } from "@/lib/intelligence/types";
import type { PortfolioAnalysis } from "@/lib/intelligence/generate";
export type PortfolioData = {
  connected: boolean;
  holdings: Position[];
  analysis: PortfolioAnalysis;
  user: { name: string };
};
export function useResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loadedUrl, setLoadedUrl] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  const retry = useCallback(() => {
    setError("");
    setLoading(true);
    setRevision((n) => n + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Unable to load this view.");
        if (!controller.signal.aborted) {
          setData(body);
          setError("");
          setLoadedUrl(url);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(
            e instanceof Error ? e.message : "Unable to load this view.",
          );
          setLoadedUrl(url);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, revision]);
  return {
    data: loadedUrl === url && !error ? data : null,
    error: loadedUrl === url ? error : "",
    loading: loadedUrl !== url || loading,
    retry,
  };
}
export function usePortfolio() {
  return useResource<PortfolioData>("/api/portfolio/me");
}
