const { ethers } = require('ethers');
const fs = require('fs');

const CONTRACT = '0x6263d965f8753cdEE92CCCC53e2C2B1066287f63';
const RPC = 'https://rpc.testnet.arc.network';
const NOTE = process.env.RUN_NOTE || '';

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
  console.log('PayClaw Agent starting...');
  console.log('Contract: ' + CONTRACT);

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet   = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT, ABI, wallet);

  console.log('Agent wallet: ' + wallet.address);

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

  console.log('Balance:       ' + balUSDC + ' USDC');
  console.log('Workers:       ' + count);
  console.log('Needed:        ' + neededUSDC + ' USDC');
  console.log('Past payments: ' + payments);

  // Load workers
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
  console.log('Active workers: ' + active.length);
  active.forEach(w => console.log('  ' + w.name + ' (' + short(w.wallet) + ') - ' + w.salary + ' USDC'));

  // Last payment timestamp across all workers
  const lastPaidTs = workers.length > 0
    ? Math.max(...workers.filter(w => w.lastPaidAt > 0).map(w => w.lastPaidAt), 0)
    : 0;
  const daysSince = lastPaidTs > 0
    ? Math.floor((Date.now() / 1000 - lastPaidTs) / 86400)
    : 999;

  console.log('Days since last payment: ' + daysSince);

  // ── DECISION LOGIC (no AI needed) ─────────────────
  const balNum    = parseFloat(balUSDC);
  const neededNum = parseFloat(neededUSDC);
  const hasBalance   = balNum >= neededNum && neededNum > 0;
  const timeOk       = daysSince >= 28;
  const firstPayment = payments === 0 && balNum > 0 && neededNum > 0;
  const shouldPay    = (hasBalance && timeOk) || firstPayment;

  let reason = '';
  if (firstPayment)          reason = 'First ever payment — balance sufficient';
  else if (!hasBalance)      reason = 'Insufficient balance (' + balUSDC + ' USDC, need ' + neededUSDC + ' USDC)';
  else if (!timeOk)          reason = 'Too soon — only ' + daysSince + ' days since last payment (need 28)';
  else                       reason = 'Balance sufficient and 28-day cycle elapsed';

  console.log('Should pay: ' + shouldPay);
  console.log('Reason:     ' + reason);

  const prev = existing();

  if (!shouldPay) {
    console.log('Agent decided NOT to pay this cycle.');
    updateJson(balUSDC, neededUSDC, payments, reason, false, null, prev);
    return;
  }

  // ── EXECUTE PAYMENT ───────────────────────────────
  const now     = new Date();
  const month   = now.toLocaleString('en-US', { month:'long', year:'numeric' });
  const payNote = NOTE || 'PayClaw Payroll - ' + month + ' - Arc Testnet';

  console.log('Executing payroll: ' + payNote);
  const tx = await contract.processAllPayouts(payNote);
  console.log('TX submitted: ' + tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block: ' + receipt.blockNumber);

  updateJson(balUSDC, neededUSDC, payments + 1, reason, true, tx.hash, prev);
  console.log('PayClaw Agent complete.');
}

function existing() {
  try { return JSON.parse(fs.readFileSync('payments.json', 'utf8')); } catch(e) { return {}; }
}

function updateJson(balance, needed, totalPayments, reason, paid, txHash, prev) {
  const cycleNum  = (prev.cycle || 0) + (paid ? 1 : 0);
  const now       = new Date();
  const nextCycle = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updated = {
    cycle:            cycleNum,
    cycle_date:       now.toISOString().split('T')[0],
    next_cycle:       nextCycle.toISOString().split('T')[0],
    last_payment_tx:  txHash || prev.last_payment_tx || null,
    agent_decision:   reason,
    paid_this_run:    paid,
    contract_balance: balance,
    payroll_needed:   needed,
    note: paid
      ? 'Cycle ' + cycleNum + ' - AI agent executed - Arc Testnet'
      : 'Cycle ' + cycleNum + ' - No payment - ' + reason,
    recipients: prev.recipients || []
  };

  fs.writeFileSync('payments.json', JSON.stringify(updated, null, 2));
  console.log('payments.json updated (cycle ' + cycleNum + ')');
}

run().catch(e => {
  console.error('Fatal: ' + e.message);
  process.exit(1);
});
