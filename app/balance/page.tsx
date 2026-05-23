'use client';

import { AppKitProvider, UnifiedBalanceWidget } from '@circle-fin/app-kit';
import { EthersV6Adapter } from '@circle-fin/adapter-ethers-v6';
import { KitPageLayout } from '@/lib/kitpage';
import { ARC_TESTNET_KIT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';
let _adapter: any = null;
function getAdapter() { if (typeof window === 'undefined') return null; if (!_adapter) _adapter = new EthersV6Adapter(); return _adapter; }

export default function BalancePage() {
  return (
    <KitPageLayout
      title="Unified Balance"
      tag="Circle App Kit · Multi-Chain · Instant Spend"
      icon="◈"
      accentColor="#00e5ff"
      desc="View your total USDC across all chains in one place. Deposit from Base, Arbitrum, or Ethereum — your balance unifies on Arc and becomes instantly available to fund the PayClaw payroll contract. Know exactly how much you have before committing to a payroll cycle."
    >
      <AppKitProvider kitKey={KIT_KEY} adapter={getAdapter()}>
        <UnifiedBalanceWidget defaultChain={ARC_TESTNET_KIT as any} />
      </AppKitProvider>
    </KitPageLayout>
  );
}
