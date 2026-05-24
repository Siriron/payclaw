'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

/* ─── HEX CANVAS (shared background) ────────────────────────────────────── */
export function HexCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const size = 28;
      const h    = size * Math.sqrt(3);
      const cols = Math.ceil(canvas!.width  / (size * 1.5)) + 2;
      const rows = Math.ceil(canvas!.height / h) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * size * 1.5;
          const y = row * h + (col % 2 === 0 ? 0 : h / 2);
          const pulse = Math.sin(t * 0.4 + col * 0.3 + row * 0.5) * 0.5 + 0.5;
          const alpha = pulse * 0.18;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * 0.88 * Math.cos(angle);
            const py = y + size * 0.88 * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
      t += 0.016;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas
      ref={ref}
      id="hexGridCanvas"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.32 }}
    />
  );
}

/* ─── WALLET STATE ───────────────────────────────────────────────────────── */
interface WalletState {
  address: string | null;
  connecting: boolean;
  error: string | null;
  chainId: number | null;
}

function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connecting: false,
    error: null,
    chainId: null,
  });

  useEffect(() => {
    // Auto-reconnect if already connected
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts[0]) {
        eth.request({ method: 'eth_chainId' }).then((chainId: string) => {
          setState(s => ({ ...s, address: accounts[0], chainId: parseInt(chainId, 16) }));
        });
      }
    }).catch(() => {});

    const onAccountsChanged = (accounts: string[]) => {
      setState(s => ({ ...s, address: accounts[0] || null }));
    };
    const onChainChanged = (chainId: string) => {
      setState(s => ({ ...s, chainId: parseInt(chainId, 16) }));
    };
    eth.on('accountsChanged', onAccountsChanged);
    eth.on('chainChanged', onChainChanged);
    return () => {
      eth.removeListener('accountsChanged', onAccountsChanged);
      eth.removeListener('chainChanged', onChainChanged);
    };
  }, []);

  async function connect() {
    const eth = (window as any).ethereum;
    if (!eth) {
      setState(s => ({ ...s, error: 'No wallet found. Install MetaMask or use a Web3 browser.' }));
      return;
    }
    setState(s => ({ ...s, connecting: true, error: null }));
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const chainId: string    = await eth.request({ method: 'eth_chainId' });
      setState(s => ({ ...s, address: accounts[0], chainId: parseInt(chainId, 16), connecting: false }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Connection rejected', connecting: false }));
    }
  }

  async function switchToArc() {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x4CB102',   // 5042002 decimal
          chainName: 'Arc Testnet',
          nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
          rpcUrls: ['https://rpc.arc.testnet.circle.com'],
          blockExplorerUrls: ['https://testnet.arcscan.app'],
        }],
      });
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message }));
    }
  }

  return { ...state, connect, switchToArc };
}

/* ─── WALLET BUTTON ─────────────────────────────────────────────────────── */
function WalletButton() {
  const { address, connecting, error, chainId, connect, switchToArc } = useWallet();
  const ARC_CHAIN_ID = 5042002;
  const onArc = chainId === ARC_CHAIN_ID;

  const btnStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    letterSpacing: '.12em',
    border: `1px solid ${address ? (onArc ? 'rgba(57,255,20,.4)' : 'rgba(255,230,0,.4)') : 'rgba(0,229,255,.35)'}`,
    background: address ? (onArc ? 'rgba(57,255,20,.06)' : 'rgba(255,230,0,.06)') : 'rgba(0,229,255,.06)',
    color: address ? (onArc ? 'var(--g1)' : 'var(--amber)') : 'var(--cyan)',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all .18s',
    whiteSpace: 'nowrap',
  };

  if (connecting) return <button style={btnStyle} disabled>CONNECTING…</button>;

  if (address && !onArc) {
    return (
      <button style={btnStyle} onClick={switchToArc} title="Switch to Arc Testnet">
        ⚠ SWITCH TO ARC
      </button>
    );
  }

  if (address) {
    return (
      <button style={btnStyle} title={address}>
        ◈ {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  return (
    <button style={btnStyle} onClick={connect}>
      CONNECT WALLET
    </button>
  );
}

/* ─── APP KIT WIDGET ─────────────────────────────────────────────────────── */
// The real App Kit SDK is programmatic (no web components). We expose a React
// wrapper that initialises @circle-fin/app-kit with the browser wallet adapter
// and renders a clean custom UI for each capability (bridge/swap/send/balance).

type KitAction = 'bridge' | 'swap' | 'send' | 'balance';

interface AppKitWidgetProps {
  action: KitAction;
  kitKey?: string;
  defaultRecipient?: string;
  accentColor?: string;
}

export function AppKitWidget({ action, kitKey, defaultRecipient, accentColor = '#00e5ff' }: AppKitWidgetProps) {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [log, setLog]         = useState('');
  const [amount, setAmount]   = useState('');
  const [recipient, setRecip] = useState(defaultRecipient || '');
  const [fromChain, setFrom]  = useState('Arc_Testnet');
  const [toChain, setTo]      = useState('Base_Sepolia');
  const [tokenIn, setTokenIn] = useState('USDC');
  const [tokenOut, setTOut]   = useState('EURC');

  const { address, connect } = useWallet();

  function setErr(msg: string) { setStatus('error'); setLog(msg); }
  function setOk(msg: string)  { setStatus('success'); setLog(msg); }

  async function run() {
    if (!address) { connect(); return; }
    if (!amount && action !== 'balance') { setErr('Enter an amount.'); return; }

    setStatus('loading');
    setLog('');

    try {
      // Dynamically import App Kit to avoid SSR issues
      const [{ AppKit }, { createViemAdapterFromProvider }] = await Promise.all([
        import('@circle-fin/app-kit'),
        import('@circle-fin/adapter-viem-v2'),
      ]);

      const eth = (window as any).ethereum;
      if (!eth) throw new Error('No wallet provider found.');

      const adapter = await createViemAdapterFromProvider({ provider: eth });
      const kit = new AppKit({});

      if (action === 'send') {
        if (!recipient) { setErr('Enter a recipient address.'); return; }
        const result = await kit.send({
          from: { adapter, chain: fromChain as any },
          to: recipient,
          amount,
          token: 'USDC',
        });
        setOk(`✓ Sent ${amount} USDC · TX: ${(result as any)?.transactionHash || 'confirmed'}`);
      }

      else if (action === 'bridge') {
        const result = await kit.bridge({
          from: { adapter, chain: fromChain as any },
          to:   { adapter, chain: toChain   as any },
          amount,
        });
        setOk(`✓ Bridged ${amount} USDC → ${toChain} · TX: ${(result as any)?.transactionHash || 'confirmed'}`);
      }

      else if (action === 'swap') {
        if (!kitKey) { setErr('Kit key not configured. Add NEXT_PUBLIC_CIRCLE_KIT_KEY to Vercel → Environments → Production.'); return; }
        const result = await kit.swap({
          from: { adapter, chain: fromChain as any },
          tokenIn,
          tokenOut,
          amountIn: amount,
          config: { kitKey },
        });
        setOk(`✓ Swapped ${amount} ${tokenIn} → ${tokenOut} · TX: ${(result as any)?.transactionHash || 'confirmed'}`);
      }

      else if (action === 'balance') {
        const bal = await kit.unifiedBalance.getBalances({ from: { adapter } });
        setOk(`◈ Unified Balance: ${(bal as any)?.balance || bal} USDC`);
      }

    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || String(e));
    }
  }

  const color = accentColor;
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,.6)',
    border: `1px solid ${color}30`,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: 13,
    padding: '10px 14px',
    outline: 'none',
    transition: 'border .18s',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    color: `${color}80`,
    letterSpacing: '.14em',
    marginBottom: 6,
    display: 'block',
  };
  const sectionStyle: React.CSSProperties = { marginBottom: 16 };

  const CHAINS = ['Arc_Testnet', 'Base_Sepolia', 'Ethereum_Sepolia', 'Arbitrum_Sepolia'];

  return (
    <div style={{ maxWidth: 480 }}>
      {/* FROM CHAIN (bridge/swap/send/balance) */}
      {(action === 'bridge' || action === 'swap' || action === 'send') && (
        <div style={sectionStyle}>
          <span style={labelStyle}>FROM CHAIN</span>
          <select value={fromChain} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle }}>
            {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* TO CHAIN (bridge only) */}
      {action === 'bridge' && (
        <div style={sectionStyle}>
          <span style={labelStyle}>TO CHAIN</span>
          <select value={toChain} onChange={e => setTo(e.target.value)} style={{ ...inputStyle }}>
            {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* TOKEN IN / OUT (swap only) */}
      {action === 'swap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...sectionStyle }}>
          <div>
            <span style={labelStyle}>TOKEN IN</span>
            <select value={tokenIn} onChange={e => setTokenIn(e.target.value)} style={{ ...inputStyle }}>
              {['USDC','EURC'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <span style={labelStyle}>TOKEN OUT</span>
            <select value={tokenOut} onChange={e => setTOut(e.target.value)} style={{ ...inputStyle }}>
              {['EURC','USDC'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* AMOUNT */}
      {action !== 'balance' && (
        <div style={sectionStyle}>
          <span style={labelStyle}>AMOUNT (USDC)</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* RECIPIENT (send only) */}
      {action === 'send' && (
        <div style={sectionStyle}>
          <span style={labelStyle}>RECIPIENT ADDRESS</span>
          <input
            type="text"
            placeholder="0x…"
            value={recipient}
            onChange={e => setRecip(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={run}
        disabled={status === 'loading'}
        style={{
          width: '100%',
          padding: '12px 0',
          background: status === 'loading' ? 'rgba(0,0,0,.4)' : `${color}18`,
          border: `1px solid ${color}60`,
          color,
          fontFamily: 'var(--disp)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '.14em',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          transition: 'all .18s',
        }}
      >
        {status === 'loading' ? '⏳ PROCESSING…' : !address ? 'CONNECT WALLET' : {
          bridge:  'BRIDGE USDC',
          swap:    'SWAP TOKENS',
          send:    'SEND USDC',
          balance: 'FETCH BALANCE',
        }[action]}
      </button>

      {/* STATUS */}
      {log && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          border: `1px solid ${status === 'error' ? 'rgba(255,68,68,.3)' : `${color}30`}`,
          background: status === 'error' ? 'rgba(255,68,68,.04)' : `${color}06`,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: status === 'error' ? 'var(--red)' : color,
          letterSpacing: '.08em',
          lineHeight: 1.6,
          wordBreak: 'break-all',
        }}>
          {log}
        </div>
      )}

      {/* SDK NOTE */}
      <div style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,255,255,.15)', letterSpacing: '.1em', lineHeight: 1.8 }}>
        // POWERED BY @circle-fin/app-kit · BROWSER WALLET ADAPTER
      </div>
    </div>
  );
}

/* ─── KIT PAGE LAYOUT (shared shell for bridge/swap/send/balance/fx) ─────── */
interface KitPageLayoutProps {
  title: string;
  tag: string;
  icon: string;
  accentColor?: string;
  desc: string;
  children: ReactNode;
}

export function KitPageLayout({ title, tag, icon, accentColor = '#00e5ff', desc, children }: KitPageLayoutProps) {
  return (
    <>
      <HexCanvas />
      <div className="scanline" />

      {/* NAV */}
      <nav className="nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(57,255,20,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 52 }}>
          <a href="/" style={{ fontFamily: 'var(--disp)', fontSize: 14, fontWeight: 900, color: 'rgba(57,255,20,.5)', letterSpacing: '.12em', textDecoration: 'none', transition: 'color .18s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--g1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(57,255,20,.5)')}>
            ← PAYCLAW
          </a>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(57,255,20,.2)', letterSpacing: '.2em' }}>/</div>
          <div style={{ fontFamily: 'var(--disp)', fontSize: 12, fontWeight: 700, color: `${accentColor}`, letterSpacing: '.1em' }}>{title.toUpperCase()}</div>
          <div style={{ marginLeft: 'auto' }}>
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: `${accentColor}60`, letterSpacing: '.2em', marginBottom: 12 }}>
            {tag}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>
            <h1 style={{ fontFamily: 'var(--disp)', fontSize: 28, fontWeight: 900, color: accentColor, letterSpacing: '.06em', textShadow: `0 0 40px ${accentColor}40` }}>
              {title.toUpperCase()}
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 600, fontWeight: 400 }}>
            {desc}
          </p>
        </div>

        {/* WIDGET AREA */}
        <div style={{ border: `1px solid ${accentColor}20`, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', padding: '28px 24px' }}>
          {children}
        </div>
      </div>
    </>
  );
}
