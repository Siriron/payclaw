# PAYCLAW v2 — Next.js

Autonomous onchain payroll on Arc Network. Powered by Circle App Kit.

## Deploy

### 1. Push to GitHub
Replace your existing repo contents with this folder.

### 2. Vercel Environment Variables
In Vercel → Settings → Environment Variables, add:
```
NEXT_PUBLIC_CIRCLE_KIT_KEY = your_kit_key_from_circle_console
CIRCLE_API_KEY = your_server_api_key_from_circle_console
```

### 3. Vercel Build Settings
- Framework: **Next.js** (auto-detected)
- Root Directory: leave blank (root of repo)
- Build Command: `next build`
- Output Directory: `.next`

### 4. GitHub Actions (agent)
Your existing `WALLET_PRIVATE_KEY` secret stays exactly as-is.
`payclaw_agent.js` and `.github/workflows/agent.yml` are untouched.

## What's new vs v1
- Full Next.js 15 app — same visuals, every animation preserved
- Circle App Kit: Send + Bridge buttons in Fund Contract panel
- Paymaster: gas sponsored by Circle (API route at `/api/paymaster`)
- Landing page: same boot screen, same design, at `/`
- App at root (no `/app` redirect needed — Next.js routing)

## Unchanged
- Solidity contract
- 30-day cron agent
- Payroll disbursement logic
- All visuals, animations, canvas effects
