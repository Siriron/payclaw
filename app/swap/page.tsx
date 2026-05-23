'use client';

import { AppKitProvider, SwapWidget } from '@circle-fin/app-kit';
import { EthersV6Adapter } from '@circle-fin/adapter-ethers-v6';
import { KitPageLayout } from '@/lib/kitpage';
import { ARC_TESTNET_KIT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';
let _adapter: any = null;
function getAdapter() { if (typeof window === 'undefined') return null; if (!_adapter) _adapter = new EthersV6Adapter(); return _adapter; }

export default function SwapPage() {
  return (
    <KitPageLayout
      title="Swap Tokens"
      tag="Circle App Kit · Arc Native · Kit Key Required"
      icon="↔"
      accentColor="#00e5ff"
      desc="Exchange tokens natively on Arc Testnet — the only testnet with Circle App Kit Swap support. Convert between available tokens on Arc before depositing into the payroll contract or distributing to workers."
    >
      <AppKitProvider kitKey={KIT_KEY} adapter={getAdapter()}>
        <SwapWidget defaultChain={ARC_TESTNET_KIT as any} />
      </AppKitProvider>
    </KitPageLayout>
  );
}
