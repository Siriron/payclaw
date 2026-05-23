'use client';

import { useEffect, useState } from 'react';
import { KitPageLayout } from '@/lib/kitpage';

const CURRENCY_INFO: Record<string, { name: string; flag: string; symbol: string }> = {
  USD: { name: 'US Dollar',         flag: '🇺🇸', symbol: '$'  },
  EUR: { name: 'Euro',              flag: '🇪🇺', symbol: '€'  },
  GBP: { name: 'British Pound',     flag: '🇬🇧', symbol: '£'  },
  AED: { name: 'UAE Dirham',        flag: '🇦🇪', symbol: 'د.إ'},
  SGD: { name: 'Singapore Dollar',  flag: '🇸🇬', symbol: 'S$' },
  CAD: { name: 'Canadian Dollar',   flag: '🇨🇦', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  JPY: { name: 'Japanese Yen',      flag: '🇯🇵', symbol: '¥'  },
  INR: { name: 'Indian Rupee',      flag: '🇮🇳', symbol: '₹'  },
  NGN: { name: 'Nigerian Naira',    flag: '🇳🇬', symbol: '₦'  },
  BRL: { name: 'Brazilian Real',    flag: '🇧🇷', symbol: 'R$' },
  MXN: { name: 'Mexican Peso',      flag: '🇲🇽', symbol: '$'  },
};

export default function FxPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('500');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function fetchRates() {
    setLoading(true);
    try {
      const r = await fetch('/api/fx');
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setRates(d.rates || {});
      setTimestamp(d.timestamp || new Date().toISOString());
      setSource(d.source || 'live');
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
    const iv = setInterval(fetchRates, 60_000);
    return () => clearInterval(iv);
  }, []);

  const usdcAmount = parseFloat(amount) || 0;

  return (
    <KitPageLayout
      title="Stablecoin FX Rates"
      tag="Arc StableFX · Circle API · Live Data"
      icon="💱"
      accentColor="#ffe600"
      desc="Live USDC conversion rates across major currencies. Workers can instantly see what their salary is worth in their local currency. Rates refresh every 60 seconds from Circle API and Arc StableFX infrastructure."
    >
      {/* AMOUNT INPUT */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,230,0,.5)', letterSpacing: '.16em', marginBottom: 8 }}>
          ENTER USDC AMOUNT TO CONVERT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid rgba(255,230,0,.25)', background: 'rgba(0,0,0,.6)', maxWidth: 320 }}>
          <div style={{ fontFamily: 'var(--disp)', fontSize: 13, fontWeight: 700, color: 'rgba(255,230,0,.7)', padding: '10px 14px', borderRight: '1px solid rgba(255,230,0,.15)', whiteSpace: 'nowrap' }}>USDC</div>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="500"
            min="0"
            step="any"
            style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 14, outline: 'none' }}
          />
        </div>
        {lastRefresh && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,230,0,.3)', letterSpacing: '.12em', marginTop: 6 }}>
            LAST UPDATED: {lastRefresh.toLocaleTimeString('en-US', { hour12: false })} UTC · SOURCE: {source.toUpperCase()}
            <button onClick={fetchRates} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'rgba(255,230,0,.5)', fontFamily: 'var(--mono)', fontSize: 8, cursor: 'pointer', letterSpacing: '.1em' }}>↻ REFRESH</button>
          </div>
        )}
      </div>

      {/* RATES GRID */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 1, background: 'rgba(255,230,0,.06)' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: '#050905', padding: '18px 16px', opacity: .4 }}>
              <div style={{ height: 12, background: 'rgba(255,230,0,.1)', borderRadius: 2, marginBottom: 8, width: '60%' }} />
              <div style={{ height: 20, background: 'rgba(255,230,0,.08)', borderRadius: 2, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ border: '1px solid rgba(255,68,68,.3)', background: 'rgba(255,68,68,.04)', padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '.1em' }}>
          ✕ {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 1, background: 'rgba(255,230,0,.06)', border: '1px solid rgba(255,230,0,.12)' }}>
          {Object.entries(CURRENCY_INFO).map(([code, info]) => {
            const rate = rates[code];
            const converted = rate ? (usdcAmount * rate) : null;
            return (
              <div key={code} style={{ background: '#050905', padding: '18px 16px', position: 'relative', transition: 'background .18s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#080e08')}
                onMouseLeave={e => (e.currentTarget.style.background = '#050905')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{info.flag}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--disp)', fontSize: 11, fontWeight: 700, color: '#e8e8e8', letterSpacing: '.08em' }}>{code}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.1em' }}>{info.name}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--disp)', fontSize: 20, fontWeight: 900, color: 'var(--amber)', letterSpacing: '.02em', marginBottom: 4 }}>
                  {converted !== null ? `${info.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,230,0,.4)', letterSpacing: '.1em' }}>
                  1 USDC = {rate ? `${info.symbol}${rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INFO */}
      <div style={{ marginTop: 20, padding: '14px 16px', border: '1px solid rgba(255,230,0,.1)', background: 'rgba(255,230,0,.015)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,230,0,.5)', letterSpacing: '.14em', marginBottom: 6 }}>// ARC STABLEFX · CIRCLE API</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Rates sourced from Circle API and Arc's native StableFX infrastructure. USDC maintains a 1:1 peg with USD — exchange rates reflect fiat market prices. Rates refresh automatically every 60 seconds.
        </div>
      </div>
    </KitPageLayout>
  );
}
