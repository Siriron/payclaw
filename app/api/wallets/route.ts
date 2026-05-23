import { NextRequest, NextResponse } from 'next/server';

const CIRCLE_API = 'https://api.circle.com/v1/w3s';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`,
  };
}

// GET /api/wallets?address=0x...
// Returns wallet info for a given address
export async function GET(req: NextRequest) {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Circle API key not configured' }, { status: 500 });

  const address = req.nextUrl.searchParams.get('address');

  try {
    // List wallets — filtered by address if provided
    const url = address
      ? `${CIRCLE_API}/wallets?address=${address}&blockchain=ARC-TESTNET`
      : `${CIRCLE_API}/wallets?blockchain=ARC-TESTNET&pageSize=20`;

    const r = await fetch(url, { headers: headers() });
    if (!r.ok) {
      const err = await r.json();
      return NextResponse.json({ error: err.message || 'Circle API error' }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/wallets
// Body: { workerName, workerWallet }
// Creates a developer-controlled wallet for a worker and returns the wallet ID
export async function POST(req: NextRequest) {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Circle API key not configured' }, { status: 500 });

  try {
    const body = await req.json();
    const { workerName } = body;
    if (!workerName) return NextResponse.json({ error: 'workerName required' }, { status: 400 });

    // Step 1: Get or create a wallet set
    const wsRes = await fetch(`${CIRCLE_API}/developer/walletSets`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        name: 'PayClaw Workers',
      }),
    });
    const wsData = await wsRes.json();
    const walletSetId = wsData.data?.walletSet?.id;
    if (!walletSetId) return NextResponse.json({ error: 'Failed to create wallet set', detail: wsData }, { status: 500 });

    // Step 2: Create wallet for worker
    const wRes = await fetch(`${CIRCLE_API}/developer/wallets`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        accountType: 'EOA',
        blockchains: ['ARC-TESTNET'],
        count: 1,
        walletSetId,
        metadata: [{ name: workerName, refId: `payclaw-worker-${workerName.toLowerCase().replace(/\s+/g, '-')}` }],
      }),
    });
    const wData = await wRes.json();
    if (!wRes.ok) return NextResponse.json({ error: wData.message || 'Failed to create wallet', detail: wData }, { status: 500 });

    return NextResponse.json({ success: true, wallet: wData.data?.wallets?.[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
