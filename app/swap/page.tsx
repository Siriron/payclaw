'use client';

import { KitPageLayout, AppKitWidget } from '@/lib/kitpage';

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
      <AppKitWidget action="swap" kitKey={KIT_KEY} accentColor="#00e5ff" />
    </KitPageLayout>
  );
}
