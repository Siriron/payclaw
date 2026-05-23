'use client';

import { useEffect, useState } from 'react';
import { KitPageLayout } from '@/lib/kitpage';
import { ARC_RPC, CONTRACT, EXPLORER, short } from '@/lib/contract';

const AGENT_WALLET = '0x0000000000000000000000000000000000000000'; // replaced with real agent wallet at deploy

interface AgentData {
  contractBalance: string;
  workerCount: number;
  totalPayments: number;
  lastBlock: string;
  agentWallet: string;
  nextRun: string;
  cycleDay: number;
}

export default function AgentPage() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        // Fetch block number
        const blockRes = await fetch(ARC_RPC, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
        });
        const blockData = await blockRes.json();
        const block = parseInt(blockData.result, 16).toLocaleString();

        // Fetch contract data
        const calls = [
          { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT, data: '0x6e15b14f' }, 'latest'], id: 1 }, // getContractBalance
          { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT, data: '0x8faeed52' }, 'latest'], id: 2 }, // workerCount
          { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT, data: '0x5b9af12b' }, 'latest'], id: 3 }, // getTotalPayments
          { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT, data: '0x8da5cb5b' }, 'latest'], id: 4 }, // owner
          { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT, data: '0x7a35a5a7' }, 'latest'], id: 5 }, // aiAgent
        ];
        const r = await fetch(ARC_RPC, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(calls),
        });
        const results = await r.json();

        const bal = results[0]?.result ? (parseInt(results[0].result, 16) / 1e18).toFixed(2) : '0.00';
        const wc = results[1]?.result ? parseInt(results[1].result, 16) : 0;
        const tp = results[2]?.result ? parseInt(results[2].result, 16) : 0;
        const agentAddr = results[4]?.result ? '0x' + results[4].result.slice(26) : AGENT_WALLET;

        // Calculate next run — day 1 or day 15 of next month
        const now = new Date();
        const day = now.getUTCDate();
        let nextRun: Date;
        if (day < 1) {
          nextRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 9, 0, 0));
        } else if (day < 15) {
          nextRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 9, 0, 0));
        } else {
          nextRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 9, 0, 0));
        }
        const daysUntil = Math.ceil((nextRun.getTime() - now.getTime()) / 86400000);

        // Load payments.json for history
        try {
          const pr = await fetch('/payments.json');
          const pd = await pr.json();
          setPayments(pd.history || []);
        } catch { }

        setData({
          contractBalance: bal,
          workerCount: wc,
          totalPayments: tp,
          lastBlock: block,
          agentWallet: agentAddr,
          nextRun: `${nextRun.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · ${daysUntil}d away`,
          cycleDay: day,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stat = (label: string, value: string, color = '#39ff14') => (
    <div style={{ background: '#000', padding: '16px 14px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: 'var(--disp)', fontSize: 18, fontWeight: 900, color }}>{value}</div>
    </div>
  );

  return (
    <KitPageLayout
      title="AI Agent Registry"
      tag="Arc ERC-8183 · Agentic Economy · Registered"
      icon="🤖"
      accentColor="#ccff00"
      desc="PayClaw's 30-day payroll agent registered on Arc's ERC-8183 standard — the onchain protocol for the agentic economy. The agent autonomously monitors the contract, checks balances, and executes payroll on schedule."
    >
      {/* ERC-8183 BADGE */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(204,255,0,.3)', background: 'rgba(204,255,0,.04)', marginBottom: 24 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccff00', boxShadow: '0 0 8px #ccff00', animation: 'pdot 1.5s infinite' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.7)', letterSpacing: '.16em' }}>ERC-8183 · ARC REGISTERED AGENT · ACTIVE</span>
      </div>

      {loading ? (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(204,255,0,.4)', letterSpacing: '.14em', padding: '24px 0' }}>
          > LOADING AGENT DATA FROM ARC...
        </div>
      ) : (
        <>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 1, background: 'rgba(204,255,0,.08)', border: '1px solid rgba(204,255,0,.12)', marginBottom: 20 }}>
            {stat('Contract Balance', `${data?.contractBalance} USDC`, '#39ff14')}
            {stat('Active Workers', String(data?.workerCount ?? '—'), '#ffe600')}
            {stat('Total Payouts', String(data?.totalPayments ?? '—'), '#ccff00')}
            {stat('Live Block', data?.lastBlock ?? '—', '#00e5ff')}
          </div>

          {/* AGENT IDENTITY */}
          <div style={{ border: '1px solid rgba(204,255,0,.15)', background: 'rgba(204,255,0,.02)', padding: '20px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.5)', letterSpacing: '.18em', marginBottom: 16 }}>// AGENT IDENTITY · ERC-8183</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {[
                ['Agent Standard', 'ERC-8183 · Arc Native'],
                ['Agent Type', 'Autonomous Payroll'],
                ['Executor', 'GitHub Actions'],
                ['Contract', short(CONTRACT)],
                ['Agent Wallet', short(data?.agentWallet ?? '—')],
                ['Network', 'Arc Testnet · Chain 1891'],
                ['Schedule', 'Day 1 & 15 · 09:00 UTC'],
                ['Next Run', data?.nextRun ?? '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(204,255,0,.05)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text2)', letterSpacing: '.1em' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--disp)', fontSize: 9, fontWeight: 700, color: 'rgba(204,255,0,.8)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JOB PIPELINE */}
          <div style={{ border: '1px solid rgba(204,255,0,.12)', padding: '20px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.5)', letterSpacing: '.18em', marginBottom: 16 }}>// JOB PIPELINE · AUTONOMOUS EXECUTION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
              {[
                { step: '01', label: 'TRIGGER', desc: 'Cron fires', color: '#ccff00' },
                { step: '02', label: 'CONNECT', desc: 'RPC link', color: '#ccff00' },
                { step: '03', label: 'CHECK', desc: 'Balance + workers', color: '#ffe600' },
                { step: '04', label: 'DECIDE', desc: 'Cycle elapsed?', color: '#ffe600' },
                { step: '05', label: 'EXECUTE', desc: 'processAllPayouts()', color: '#39ff14' },
                { step: '06', label: 'CONFIRM', desc: 'Block confirmed', color: '#39ff14' },
                { step: '07', label: 'LOG', desc: 'payments.json', color: '#00e5ff' },
              ].map((s, i) => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', padding: '0 8px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: `${s.color}88`, letterSpacing: '.14em', marginBottom: 4 }}>{s.step}</div>
                    <div style={{ width: 36, height: 36, border: `1px solid ${s.color}44`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--disp)', fontSize: 7, fontWeight: 700, color: s.color, background: `${s.color}08`, margin: '0 auto 4px' }}>
                      {s.label.slice(0, 3)}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 6, color: 'var(--muted)', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{s.desc}</div>
                  </div>
                  {i < 6 && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(204,255,0,.2)', flexShrink: 0, padding: '0 4px', marginBottom: 16 }}>→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT HISTORY */}
          <div style={{ border: '1px solid rgba(204,255,0,.12)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.5)', letterSpacing: '.18em', marginBottom: 16 }}>// EXECUTION HISTORY · ONCHAIN RECORDS</div>
            {payments.length === 0 ? (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '.12em', padding: '16px 0', lineHeight: 1.8 }}>
                // NO EXECUTION HISTORY YET<br />
                AGENT AWAITING FIRST CYCLE
              </div>
            ) : (
              <div>
                {payments.map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(204,255,0,.06)' }}>
                    <div style={{ fontFamily: 'var(--disp)', fontSize: 10, fontWeight: 700, color: 'rgba(204,255,0,.6)', flexShrink: 0 }}>CYCLE {p.cycle}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text2)', letterSpacing: '.1em', flex: 1 }}>{p.date}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#39ff14', letterSpacing: '.1em' }}>{p.workers} workers</div>
                    {p.tx && (
                      <a href={`${EXPLORER}${p.tx}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(0,229,255,.6)', letterSpacing: '.1em', textDecoration: 'none' }}>
                        ↗ {short(p.tx)}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONTRACT LINK */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <a href={`https://testnet.arcscan.app/address/${CONTRACT}`} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.5)', letterSpacing: '.12em', textDecoration: 'none', padding: '7px 12px', border: '1px solid rgba(204,255,0,.15)' }}>
              ↗ VIEW CONTRACT ON ARCSCAN
            </a>
            <a href="https://github.com/siriron/payclaw" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(204,255,0,.5)', letterSpacing: '.12em', textDecoration: 'none', padding: '7px 12px', border: '1px solid rgba(204,255,0,.15)' }}>
              ↗ VIEW AGENT SOURCE
            </a>
          </div>
        </>
      )}
    </KitPageLayout>
  );
}
