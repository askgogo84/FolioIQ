'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

type MarketItem = {
  name?: string;
  sym?: string;
  value?: string | number;
  val?: string | number;
  change?: string | number;
  chg?: string | number;
  up?: boolean;
};

export default function MarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            MARKET
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Live market feed.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            This page reads from the app market API. No fixed market prices are shown here.
          </div>
        </div>

        {loading && <StateCard title="Loading market data…" body="Checking the live market API." />}

        {!loading && items.length === 0 && (
          <StateCard title="Market feed unavailable." body="The market API did not return live rows. We are not showing fallback prices to avoid misleading values." />
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {items.map((item, i) => {
              const name = item.name || item.sym || 'Market item';
              const value = item.value ?? item.val ?? '—';
              const rawChange = item.change ?? item.chg ?? 0;
              const changeNum = typeof rawChange === 'number' ? rawChange : Number(String(rawChange).replace('%', ''));
              const up = Number.isFinite(changeNum) ? changeNum >= 0 : item.up === true;

              return (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 22 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>{name}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, marginTop: 10, color: 'var(--ink)' }}>{String(value)}</div>
                  <div style={{ marginTop: 8, color: up ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {up ? '▲' : '▼'} {Number.isFinite(changeNum) ? Math.abs(changeNum).toFixed(2) : '—'}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>{title}</h2>
      <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 720 }}>{body}</p>
    </div>
  );
}