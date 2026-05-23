import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAYCLAW — Payment Suite',
  description: 'Complete onchain payment infrastructure on Arc Network. Powered by Circle.',
  openGraph: {
    title: 'PAYCLAW — Payment Suite',
    description: 'Autonomous payroll, bridge, swap, send, FX rates and AI agent on Arc Network.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpolygon points='16,2 28,9 28,23 16,30 4,23 4,9' fill='%23000' stroke='%2339ff14' stroke-width='2'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' font-family='monospace' font-size='12' font-weight='bold' fill='%2339ff14'%3E%24%3C/text%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
