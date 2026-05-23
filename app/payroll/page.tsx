'use client';

import { useEffect, useRef } from 'react';
import { HexCanvas } from '@/lib/kitpage';
import Link from 'next/link';

export default function PayrollPage() {
  return (
    <>
      <HexCanvas />
      <div className="scanline" />
      {/* Minimal nav */}
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 52 }}>
          <Link href="/" style={{ fontFamily: 'var(--disp)', fontSize: 14, fontWeight: 900, color: 'rgba(57,255,20,.5)', letterSpacing: '.12em', textDecoration: 'none', transition: 'color .18s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--g1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(57,255,20,.5)')}>
            ← PAYCLAW
          </Link>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(57,255,20,.2)', letterSpacing: '.2em' }}>/</div>
          <div style={{ fontFamily: 'var(--disp)', fontSize: 12, fontWeight: 700, color: 'var(--g1)', letterSpacing: '.1em' }}>AUTONOMOUS PAYROLL</div>
          <div style={{ marginLeft: 'auto' }}>
            <div className="net-badge"><div className="pdot" /><span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(57,255,20,.5)', letterSpacing: '.12em' }}>ARC TESTNET</span></div>
          </div>
        </div>
      </nav>
      {/* Full-height iframe — loads original index.html untouched */}
      <iframe
        src="/index.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 52px)',
          border: 'none',
          display: 'block',
          position: 'relative',
          zIndex: 1,
        }}
        title="PayClaw Autonomous Payroll"
      />
    </>
  );
}
