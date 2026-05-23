'use client';

import { KitPageLayout } from '@/lib/kitpage';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function BalancePage() {
  return (
    <KitPageLayout
      title="Unified Balance"
      tag="Circle App Kit · Multi-Chain · Instant Spend"
      icon="◈"
      accentColor="#00e5ff"
      desc="View your total USDC across all chains in one place. Deposit from Base, Arbitrum, or Ethereum — your balance unifies on Arc and becomes instantly available to fund the PayClaw payroll contract. Know exactly how much you have before committing to a payroll cycle."
    >
      {KIT_KEY ? (
        <div id="circle-balance-widget" style={{ minHeight: 320 }}>
          <circle-unified-balance-widget kit-key={KIT_KEY} />
        </div>
      ) : (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(0,229,255,.35)', letterSpacing: '.12em', padding: '32px 0', lineHeight: 2 }}>
          // CIRCLE KIT KEY NOT CONFIGURED<br />
          ADD NEXT_PUBLIC_CIRCLE_KIT_KEY TO VERCEL ENV VARS<br />
          GET YOUR KEY AT CONSOLE.CIRCLE.COM
        </div>
      )}
    </KitPageLayout>
  );
}
