'use client';

import { KitPageLayout, AppKitWidget } from '@/lib/kitpage';

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
      <AppKitWidget action="bridge" kitKey={KIT_KEY} accentColor="#00e5ff" />
    </KitPageLayout>
  );
}
