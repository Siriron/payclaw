# PayClaw

Autonomous onchain payroll built on Arc Testnet.

## What it does

Every 30 days the AI agent wakes up, checks the balance, and sends USDC to every active worker wallet automatically. Every payment is recorded onchain forever.

## Live

**App:** [payclaw.vercel.app](https://payclaw.vercel.app) 


## Stack

- **Smart Contract:** Solidity — deployed on Arc Testnet
- **Frontend:** Vanilla HTML/CSS/JS — deployed on Vercel
- **Agent:** Node.js — runs on GitHub Actions
- **Chain:** Arc Testnet (USDC as native gas token)
