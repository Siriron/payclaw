'use client';

import { KitPageLayout } from '@/lib/kitpage';
import { CONTRACT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function SendPage() {
  return (
    <KitPageLayout
      title="Send Payment"
      tag="Circle App Kit · Any Amount · Sub-Second Finality"
      icon="→"
      accentColor="#00e5ff"
      desc="Send any USDC amount to any wallet on Arc — from $0.001 to $1,000,000, same speed, same finality. The PayClaw contract address is pre-filled. Use this to fund payroll directly or make one-time payments to workers outside the regular 30-day cycle."
    >
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(0,229,255,.4)', letterSpacing: '.14em', marginBottom: 12 }}>
        PRE-FILLED RECIPIENT: PayClaw Contract · {CONTRACT.slice(0, 10)}...{CONTRACT.slice(-6)}
      </div>
      {KIT_KEY ? (
        <div id="circle-send-widget" style={{ minHeight: 320 }}
          ref={el => { if (el && !el.firstChild) { const w = document.createElement('circle-send-widget'); w.setAttribute('kit-key', KIT_KEY); w.setAttribute('default-recipient', CONTRACT); el.appendChild(w); } }}
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
