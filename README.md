# PAYCLAW — Autonomous Onchain Payroll

**Payroll that runs without you. Every 30 days. No banks. No middlemen. No manual work.**

Live at **[payclaw.vercel.app](https://payclaw.vercel.app)**

---

## What It Does

PayClaw is a fully autonomous payroll system built on Arc Testnet. You deposit USDC once, register your workers, and the system handles everything else — automatically, onchain, forever.

Every 30 days a GitHub Actions agent wakes up, reads the smart contract, checks the balance, and sends USDC directly to every active worker wallet. Every payment is recorded permanently onchain. No human needs to press a button. No bank needs to approve a transfer. No intermediary takes a cut.

This is what payroll looks like when it's built on a purpose-built financial L1 instead of legacy rails.

---

## The Problem It Solves

Traditional payroll is slow, expensive, and fragile:

- Bank transfers take 1–5 business days
- International payments cost 3–7% in fees
- Someone has to manually approve each cycle
- Workers in certain countries can't receive payments at all
- The entire system goes down if one party fails to act

PayClaw eliminates all of that. USDC moves in under a second. Fees are negligible. The agent runs on a schedule regardless of whether you're online. Workers anywhere in the world with a wallet address get paid.

---

## Architecture

PayClaw is built from three integrated layers that work together autonomously.

### Layer 1 — Smart Contract (Solidity · Arc Testnet)

The PayClaw contract is the source of truth. It stores:

- The owner and AI agent wallet addresses
- A registry of active worker wallets and names
- The USDC balance available for payroll
- A complete history of every payment ever made, with timestamps

Key functions:
- `addWorker(address, name)` — register a worker
- `removeWorker(address)` — deactivate a worker
- `runPayroll(amount)` — distribute USDC to all active workers (agent-only)
- `deposit()` — fund the contract
- `getWorkers()` — read all registered wallets
- `getTotalPayments()` — audit the full payment history

The contract is deployed on Arc Testnet (Chain ID: 5042002), which uses USDC as the native gas token — meaning every transaction on the network is denominated in the same stablecoin being moved. No ETH, no gas token volatility.

### Layer 2 — AI Agent (Node.js · GitHub Actions)

The agent runs on a 30-day cron schedule via GitHub Actions. It:

1. Reads the contract to get the current worker list and balance
2. Verifies sufficient funds exist for the payroll cycle
3. Calls `runPayroll()` with the configured amount per worker
4. Logs the result — success or failure — back to the contract

The agent wallet holds no funds. It only has permission to trigger payroll, not to withdraw. This design means even if the agent key were compromised, funds cannot be stolen — only payroll can be executed.

### Layer 3 — Frontend Suite (Next.js 15 · Circle App Kit)

The frontend is a full payment operations suite built around Circle's App Kit SDK. It gives operators and workers a complete view of the system and access to all payment primitives.

---

## Circle App Kit Integration

PayClaw uses the `@circle-fin/app-kit` SDK with the Viem browser wallet adapter (`@circle-fin/adapter-viem-v2`). All kit capabilities are integrated via a unified `AppKitWidget` component that connects to the user's browser wallet (MetaMask or any EIP-1193 provider) and routes to the appropriate SDK method.

### Bridge

**Route:** `/bridge`

Moves USDC across blockchains using Circle's CCTP v2 protocol. Workers or operators can bring funds from Ethereum, Base, or Arbitrum directly into Arc Testnet in a single transaction — 1:1, no slippage, no wrapped tokens.

```ts
await kit.bridge({
  from: { adapter, chain: "Base_Sepolia" },
  to:   { adapter, chain: "Arc_Testnet" },
  amount: "100.00",
});
```

### Swap

**Route:** `/swap`

Exchanges one token for another natively on Arc Testnet. Requires a Circle Kit Key. Supports USDC ↔ EURC swaps, enabling workers to hold their preferred stablecoin denomination.

```ts
await kit.swap({
  from: { adapter, chain: "Arc_Testnet" },
  tokenIn: "USDC",
  tokenOut: "EURC",
  amountIn: "50.00",
  config: { kitKey: process.env.KIT_KEY },
});
```

### Send

**Route:** `/send`

Transfers USDC between wallets on the same chain. The PayClaw contract address is pre-filled as the default recipient, making it one-click to fund payroll. Operators can also use this for ad-hoc payments outside the regular 30-day cycle.

```ts
await kit.send({
  from: { adapter, chain: "Arc_Testnet" },
  to: "0xPayClawContract",
  amount: "500.00",
  token: "USDC",
});
```

### Unified Balance

**Route:** `/balance`

Reads the user's cross-chain USDC position in one call. Funds deposited from Base, Arbitrum, or Ethereum unify into a single spendable balance on Arc — no manual bridging required before spending.

```ts
await kit.unifiedBalance.getBalances({ adapter });
```

---

## Stablecoin FX Rates

**Route:** `/fx`

A live currency converter that shows USDC value across 12 major fiat currencies — USD, EUR, GBP, AED, SGD, CAD, AUD, JPY, INR, NGN, BRL, MXN. Rates refresh every 60 seconds from Circle's API. Workers can see exactly what their salary is worth in their local currency before and after each payroll cycle.

---

## Agent Dashboard

**Route:** `/agent`

A real-time view of the autonomous agent's state — current contract balance, registered worker count, total historical payments, next scheduled run, and block height. All data is fetched live from Arc Testnet RPC with no backend intermediary.

---

## Why Arc Testnet

Arc is a Layer-1 blockchain built specifically for financial applications. PayClaw uses Arc because:

- **USDC as native gas** — every transaction is paid in the same stablecoin being moved, eliminating gas token volatility
- **Sub-second finality** — payroll confirmations are near-instant, not 12–30 second waits
- **Circle-native** — Circle's App Kit, CCTP, and developer tools are first-class on Arc
- **Built for agents** — Arc's design is optimized for autonomous, programmatic financial activity

---

## Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity · Arc Testnet (Chain ID 5042002) |
| Frontend | Next.js 15 · TypeScript · React 19 |
| Payment SDK | @circle-fin/app-kit · @circle-fin/adapter-viem-v2 |
| Agent | Node.js · GitHub Actions (30-day cron) |
| Deployment | Vercel |
| Chain | Arc Testnet · USDC native gas |

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | Circle Console Kit Key — required for Swap |
| `CIRCLE_API_KEY` | Circle API Key — used for wallet API routes and FX |

Both must be set in Vercel under **Settings → Environments → Production**.

---

## Links

- **Live App:** [payclaw.vercel.app](https://payclaw.vercel.app)
- **Arc Testnet Explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)
- **Arc Docs:** [docs.arc.network](https://docs.arc.network)
- **Circle App Kit Docs:** [docs.arc.network/app-kit](https://docs.arc.network/app-kit)
- **ARC House Post:** [PayClaw — Autonomous Payroll That Runs Without You](https://community.arc.io/home/clubs/agentic-economy-dofua/forum/boards/agentic-economy-72a/posts/payclaw-autonomous-payroll-that-runs-without-you-udmh77ehzw)

---

## Local Development

```bash
git clone https://github.com/Siriron/payclaw
cd payclaw
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_CIRCLE_KIT_KEY=your_kit_key
CIRCLE_API_KEY=your_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

Built on Arc Testnet by Circle.
