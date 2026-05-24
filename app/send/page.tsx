'use client';

import { KitPageLayout, AppKitWidget } from '@/lib/kitpage';
import { CONTRACT } from '@/lib/contract';

const KIT_KEY = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY ?? '';

export default function SendPage() {
  return (
    <KitPageLayout
      title="Send Payment"
      tag="Circle App Kit · Any Amount · Sub-Second Finality"
      icon="→"
      accentColor="#00e5ff"
      desc="Send any USDC amount to any wallet on Arc — from $0.001 to $1,000,000, same speed, same finality. The PayClaw contract address is pre-filled as default recipient."
    >
      <AppKitWidget
        action="send"
        kitKey={KIT_KEY}
        defaultRecipient={CONTRACT}
        accentColor="#00e5ff"
      />
    </KitPageLayout>
  );
}
