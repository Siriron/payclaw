'use client';

import { KitPageLayout } from '@/lib/kitpage';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function SwapPage() {
  return (
    <KitPageLayout
      title="Swap Tokens"
      tag="Circle App Kit · Arc Native · Kit Key Required"
      icon="↔"
      accentColor="#00e5ff"
      desc="Exchange tokens natively on Arc Testnet — the only testnet with Circle App Kit Swap support. Convert between available tokens on Arc before depositing into the payroll contract or distributing to workers."
    >
      {KIT_KEY ? (
        <div id="circle-swap-widget" style={{ minHeight: 320 }}>
          <circle-swap-widget kit-key={KIT_KEY} />
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
