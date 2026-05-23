import { NextResponse } from 'next/server';

// Supported fiat currencies to show
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'JPY', 'INR', 'NGN', 'BRL', 'MXN'];

export async function GET() {
  const apiKey = process.env.CIRCLE_API_KEY;

  try {
    // Circle API — stablecoin FX rates
    // Endpoint: GET /v1/stablecoins (public) or /v1/fx/rates (authenticated)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Try Circle FX rates API
    const res = await fetch('https://api.circle.com/v1/fxRates', {
      headers,
      next: { revalidate: 60 }, // cache 60s
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ source: 'circle', rates: data.data || data, currencies: CURRENCIES });
    }

    // Fallback: fetch from public exchange rate API
    const fallback = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 300 },
    });
    const fallbackData = await fallback.json();

    // Build USDC rates (USDC ≈ 1 USD)
    const rates: Record<string, number> = {};
    CURRENCIES.forEach(cur => {
      if (fallbackData.rates?.[cur]) {
        rates[cur] = fallbackData.rates[cur];
      }
    });

    return NextResponse.json({
      source: 'fallback',
      base: 'USDC',
      rates,
      currencies: CURRENCIES,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
