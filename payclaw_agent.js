const { ethers } = require('ethers');
const fs = require('fs');

const CONTRACT = '0x6263d965f8753cdEE92CCCC53e2C2B1066287f63';
const RPC      = 'https://rpc.testnet.arc.network';
const NOTE     = process.env.RUN_NOTE  || '';
const FORCE    = process.env.FORCE_PAY === 'true';

const ABI = [
  "function getContractBalance() view returns (uint256)",
  "function workerCount() view returns (uint256)",
  "function getWorker(uint256) view returns (tuple(string name, address wallet, uint256 salaryPerCycle, bool isActive, uint256 totalPaid, uint256 lastPaidAt))",
  "function getTotalPayrollNeeded() view returns (uint256)",
  "function processAllPayouts(string note)",
  "function getTotalPayments() view returns (uint256)"
];

const fmt18 = (n) => (Number(n) / 1e18).toFixed(2);
const short  = (a) => a ? a.slice(0,6) + '...' + a.slice(-4) : '-';

async function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PayClaw Agent v2');
  console.log('Time: ' + new Date().toUTCString());
  console.log('Contract: ' + CONTRACT);
  console.log('Force: ' + FORCE);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ── VALIDATE PRIVATE KEY ──────────────────────
  if (!process.env.WALLET_PRIVATE_KEY) {
    console.error('FATAL: WALLET_PRIVATE_KEY secret not set in GitHub repo');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet   = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT, ABI, wallet);

  console.log('Agent wallet: ' + wallet.address);

  // ── FETCH CONTRACT STATE ──────────────────────
  const [balance, wCount, needed, totalPay] = await Promise.all([
    contract.getContractBalance(),
    contract.workerCount(),
    contract.getTotalPayrollNeeded(),
    contract.getTotalPayments()
  ]);

  const balUSDC    = fmt18(balance);
  const neededUSDC = fmt18(needed);
  const count      = Number(wCount);
  const payments   = Number(totalPay);

  console.log('\n── CONTRACT STATE ──');
  console.log('Balance:       ' + balUSDC + ' USDC');
  console.log('Workers:       ' + count);
  console.log('Needed:        ' + neededUSDC + ' USDC');
  console.log('Past payments: ' + payments);

  // ── LOAD WORKERS ─────────────────────────────
  const workers = [];
  for (let i = 0; i < count; i++) {
    const w = await contract.getWorker(i);
    workers.push({
      name:       w.name,
      wallet:     w.wallet,
      salary:     fmt18(w.salaryPerCycle),
      isActive:   w.isActive,
      totalPaid:  fmt18(w.totalPaid),
      lastPaidAt: Number(w.lastPaidAt)
    });
  }

  const active = workers.filter(w => w.isActive);
  console.log('\n── WORKERS ──');
  console.log('Active: ' + active.length + ' / ' + count);
  active.forEach(w => console.log('  • ' + w.name + ' (' + short(w.wallet) + ') — ' + w.salary + ' USDC'));

  // ── CYCLE TIMING ─────────────────────────────
  // Use last payment timestamp from workers — most accurate source
  const paidWorkers = workers.filter(w => w.lastPaidAt > 0);
  const lastPaidTs  = paidWorkers.length > 0
    ? Math.max(...paidWorkers.map(w => w.lastPaidAt))
    : 0;
  const nowTs     = Math.floor(Date.now() / 1000);
  const daysSince = lastPaidTs > 0
    ? Math.floor((nowTs - lastPaidTs) / 86400)
    : 999; // Never paid — treat as overdue

  const nextPaymentTs = lastPaidTs + (30 * 86400);
  const nextPayDate   = lastPaidTs > 0
    ? new Date(nextPaymentTs * 1000).toUTCString()
    : 'NOW (first payment)';

  console.log('\n── CYCLE ──');
  console.log('Last paid:      ' + (lastPaidTs > 0 ? new Date(lastPaidTs * 1000).toUTCString() : 'Never'));
  console.log('Days since:     ' + (daysSince === 999 ? 'N/A (first)' : daysSince));
  console.log('Next due:       ' + nextPayDate);

  // ── DECISION ─────────────────────────────────
  const balNum    = parseFloat(balUSDC);
  const neededNum = parseFloat(neededUSDC);

  const hasWorkers   = active.length > 0;
  const hasBalance   = balNum >= neededNum && neededNum > 0;
  const cycleElapsed = daysSince >= 28;
  const firstPayment = payments === 0 && balNum > 0 && neededNum > 0;
  const shouldPay    = FORCE || ((hasWorkers && hasBalance && cycleElapsed) || firstPayment);

  let reason = '';
  if (FORCE)              reason = 'FORCED by workflow_dispatch';
  else if (!hasWorkers)   reason = 'No active workers registered';
  else if (!hasBalance)   reason = 'Insufficient balance — have ' + balUSDC + ' USDC, need ' + neededUSDC + ' USDC';
  else if (firstPayment)  reason = 'First ever payment — balance sufficient';
  else if (!cycleElapsed) reason = 'Cycle not elapsed — only ' + daysSince + ' days since last payment (need 28)';
  else                    reason = '28-day cycle elapsed and balance sufficient';

  console.log('\n── DECISION ──');
  console.log('Has workers:    ' + hasWorkers);
  console.log('Has balance:    ' + hasBalance + ' (' + balUSDC + ' / ' + neededUSDC + ')');
  console.log('Cycle elapsed:  ' + cycleElapsed + ' (' + daysSince + ' days)');
  console.log('First payment:  ' + firstPayment);
  console.log('Force:          ' + FORCE);
  console.log('→ Should pay:   ' + shouldPay);
  console.log('→ Reason:       ' + reason);

  const prev = existing();

  if (!shouldPay) {
    console.log('\nAgent decided NOT to pay this cycle.');
    updateJson(balUSDC, neededUSDC, payments, reason, false, null, prev, workers, nextPayDate);
    return;
  }

  // ── EXECUTE PAYMENT ───────────────────────────
  const now     = new Date();
  const month   = now.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const payNote = NOTE || 'PayClaw Payroll — ' + month + ' — Arc Testnet';

  console.log('\n── EXECUTING PAYROLL ──');
  console.log('Note: ' + payNote);

  const tx = await contract.processAllPayouts(payNote);
  console.log('TX submitted: ' + tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('✓ Confirmed in block: ' + receipt.blockNumber);
  console.log('✓ Gas used: ' + receipt.gasUsed.toString());

  updateJson(balUSDC, neededUSDC, payments + 1, reason, true, tx.hash, prev, workers, nextPayDate);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PayClaw Agent complete. ' + active.length + ' workers paid.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function existing() {
  try { return JSON.parse(fs.readFileSync('payments.json', 'utf8')); } catch { return {}; }
}

function updateJson(balance, needed, totalPayments, reason, paid, txHash, prev, workers, nextPayDate) {
  const cycleNum  = (prev.cycle || 0) + (paid ? 1 : 0);
  const now       = new Date();
  const nextCycle = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Build recipient list from active workers
  const active = (workers || []).filter(w => w.isActive);
  const recipients = paid
    ? active.map(w => ({ name: w.name, wallet: w.wallet, amount: w.salary + ' USDC' }))
    : (prev.recipients || []);

  // Build payment history
  const history = prev.history || [];
  if (paid && txHash) {
    history.push({
      cycle:     cycleNum,
      date:      now.toISOString().split('T')[0],
      tx:        txHash,
      workers:   active.length,
      total:     balance + ' USDC',
      reason:    reason
    });
  }

  const updated = {
    cycle:            cycleNum,
    cycle_date:       now.toISOString().split('T')[0],
    next_cycle:       nextCycle.toISOString().split('T')[0],
    next_payment_due: nextPayDate,
    last_payment_tx:  txHash || prev.last_payment_tx || null,
    agent_decision:   reason,
    paid_this_run:    paid,
    contract_balance: balance,
    payroll_needed:   needed,
    note: paid
      ? 'Cycle ' + cycleNum + ' paid — Arc Testnet'
      : 'Cycle ' + cycleNum + ' skipped — ' + reason,
    recipients,
    history
  };

  const json = JSON.stringify(updated, null, 2);
  fs.writeFileSync('payments.json', json);
  // Also update public/payments.json so Next.js serves live data
  try {
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/payments.json', json);
  } catch (e) {
    console.log('Note: could not write public/payments.json:', e.message);
  }
  console.log('payments.json updated (cycle ' + cycleNum + ')');
}

run().catch(e => {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('FATAL ERROR: ' + e.message);
  if (e.stack) console.error(e.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
});
