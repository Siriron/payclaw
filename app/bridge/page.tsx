'use client';

import { KitPageLayout } from '@/lib/kitpage';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function BridgePage() {
  return (
    <KitPageLayout
      title="Bridge USDC"
      tag="Circle App Kit · CCTP v2 · Cross-Chain"
      icon="⇄"
      accentColor="#00e5ff"
      desc="Move USDC from Base, Arbitrum, or Ethereum directly into Arc — 1:1 capital efficiency, no slippage, no wrapped tokens. Bridge funds in, then deposit to the PayClaw payroll contract from your Arc wallet."
    >
      {KIT_KEY ? (
        <div id="circle-bridge-widget" style={{ minHeight: 320 }}
          ref={el => { if (el && !el.firstChild) { const w = document.createElement('circle-bridge-widget'); w.setAttribute('kit-key', KIT_KEY); el.appendChild(w); } }}
        />
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
