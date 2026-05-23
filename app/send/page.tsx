'use client';

import { AppKitProvider, SendWidget } from '@circle-fin/app-kit';
import { EthersV6Adapter } from '@circle-fin/adapter-ethers-v6';
import { KitPageLayout } from '@/lib/kitpage';
import { ARC_TESTNET_KIT, CONTRACT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';
let _adapter: any = null;
function getAdapter() { if (typeof window === 'undefined') return null; if (!_adapter) _adapter = new EthersV6Adapter(); return _adapter; }

export default function SendPage() {
  return (
    <KitPageLayout
      title="Send Payment"
      tag="Circle App Kit · Any Amount · Sub-Second Finality"
      icon="→"
      accentColor="#00e5ff"
      desc="Send any USDC amount to any wallet on Arc — from $0.001 to $1,000,000, same speed, same finality. The PayClaw contract address is pre-filled. Use this to fund payroll directly or make one-time payments to workers outside the regular 30-day cycle."
    >
      <div style={{fontFamily:'var(--mono)',fontSize:9,color:'rgba(0,229,255,.4)',letterSpacing:'.14em',marginBottom:12}}>
        PRE-FILLED RECIPIENT: PayClaw Contract · {CONTRACT.slice(0,10)}...{CONTRACT.slice(-6)}
      </div>
      <AppKitProvider kitKey={KIT_KEY} adapter={getAdapter()}>
        <SendWidget
          defaultChain={ARC_TESTNET_KIT as any}
          defaultRecipient={CONTRACT}
        />
      </AppKitProvider>
    </KitPageLayout>
  );
}
