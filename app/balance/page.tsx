'use client';

import { KitPageLayout, AppKitWidget } from '@/lib/kitpage';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function BalancePage() {
  return (
    <KitPageLayout
      title="Unified Balance"
      tag="Circle App Kit · Multi-Chain · Instant Spend"
      icon="◈"
      accentColor="#00e5ff"
      desc="View your total USDC across all chains in one place. Deposit from Base, Arbitrum, or Ethereum — your balance unifies on Arc and becomes instantly available to fund the PayClaw payroll contract."
    >
      <AppKitWidget action="balance" kitKey={KIT_KEY} accentColor="#00e5ff" />
    </KitPageLayout>
  );
}
