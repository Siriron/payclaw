'use client';

import { AppKitProvider, BridgeWidget } from '@circle-fin/app-kit';
import { EthersV6Adapter } from '@circle-fin/adapter-ethers-v6';
import { KitPageLayout } from '@/lib/kitpage';
import { ARC_TESTNET_KIT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';
let _adapter: any = null;
function getAdapter() { if (typeof window === 'undefined') return null; if (!_adapter) _adapter = new EthersV6Adapter(); return _adapter; }

export default function BridgePage() {
  return (
    <KitPageLayout
      title="Bridge USDC"
      tag="Circle App Kit · CCTP v2 · Cross-Chain"
      icon="⇄"
      accentColor="#00e5ff"
      desc="Move USDC from Base, Arbitrum, or Ethereum directly into Arc — 1:1 capital efficiency, no slippage, no wrapped tokens. Bridge funds in, then deposit to the PayClaw payroll contract from your Arc wallet."
    >
      <AppKitProvider kitKey={KIT_KEY} adapter={getAdapter()}>
        <BridgeWidget defaultDestinationChain={ARC_TESTNET_KIT as any} />
      </AppKitProvider>
    </KitPageLayout>
  );
}
