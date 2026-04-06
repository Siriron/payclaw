const { ethers } = require('ethers');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const CONTRACT = '0x6263d965f8753cdEE92CCCC53e2C2B1066287f63';
const RPC = 'https://rpc.testnet.arc.network';
const NOTE = process.env.RUN_NOTE || '';

const ABI = [
  "function getContractBalance() view returns (uint256)",
  "function workerCount() view returns (uint256)",
  "function getWorker(uint256) view returns (tuple(string name, address wallet, uint256 salaryPerCycle, bool isActive, uint256 totalPaid, uint256 lastPaidAt))",
  "function getTotalPayrollNeeded() view returns (uint256)",
  "function processAllPayouts(string note) nonpayable",
  "function getTotalPayments() view returns (uint256)"
];

const fmt18 = (n) => (Number(n) / 1e18).toFixed(2);
const short = (a) => a ? a.slice(0,6) + '...' + a.slice(-4) : '-';

async function run() {
  console.log('PayClaw Agent starting...');
  console.log('Contract: ' + CONTRACT);

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT, ABI, wallet);

  console.log('Agent wallet: ' + wallet.address);

  const [balance, wCount, needed, totalPay] = await Promise.all([
    contract.getContractBalance(),
    contract.workerCount(),
    contract.getTotalPayrollNeeded(),
    contract.getTotalPayments()
  ]);

  const balUSDC = fmt18(balance);
  const neededUSDC = fmt18(needed);
  const count = Number(wCount);
  const payments = Number(totalPay);

  console.log('Balance: ' + balUSDC + ' USDC');
  console.log('Workers: ' + count);
  console.log('Needed: ' + neededUSDC + ' USDC');
  console.log('Past payments: ' + payments);

  const workers = [];
  for (let i = 0; i < count; i++) {
    const w = await contract.getWorker(i);
    workers.push({
      id: i,
      name: w.name,
      wallet: w.wallet,
      salary: fmt18(w.salaryPerCycle),
      isActive: w.isActive,
      totalPaid: fmt18(w.totalPaid),
      lastPaidAt: Number(w.lastPaidAt)
    });
  }

  const activeWorkers = workers.filter(w => w.isActive);
  console.log('Active workers: ' + activeWorkers.length);
  activeWorkers.forEach(w => {
    console.log('  ' + w.name + ' (' + short(w.wallet) + ') - ' + w.salary + ' USDC');
  });

  const lastPayTimestamp = workers.length > 0
    ? Math.max(...workers.filter(w => w.lastPaidAt > 0).map(w => w.lastPaidAt), 0)
    : 0;
  const daysSincePay = lastPayTimestamp > 0
    ? Math.floor((Date.now() / 1000 - lastPayTimestamp) / 86400)
    : 999;

  console.log('Days since last payment: ' + daysSincePay);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const workerList = activeWorkers.map(w => '  ' + w.name + ': ' + w.salary + ' USDC').join('\n');

  const prompt = [
    'You are the autonomous payment agent for PayClaw onchain payroll on Arc Testnet.',
    '',
    'Current state:',
    '- Contract balance: ' + balUSDC + ' USDC',
    '- Total payroll needed: ' + neededUSDC + ' USDC',
    '- Active workers: ' + activeWorkers.length,
    '- Days since last payment: ' + daysSincePay,
    '- Total past payments made: ' + payments,
    '',
    'Workers:',
    workerList,
    '',
    'Rules:',
    '1. Pay if balance >= needed AND days since last pay >= 28',
    '2. Do NOT pay if balance < needed',
    '3. Do NOT pay if paid less than 28 days ago',
    '4. Always pay if first ever payment (payments === 0) and balance >= needed',
    '',
    'Respond with ONLY valid JSON, no markdown, no explanation:',
    '{"shouldPay": true, "reason": "one sentence", "note": "April 2026 Payroll - Arc Testnet"}'
  ].join('\n');

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  console.log('Gemini response: ' + text);

  let decision;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    decision = JSON.parse(clean);
  } catch(e) {
    console.log('Gemini parse error - defaulting to no pay');
    decision = { shouldPay: false, reason: 'parse error', note: '' };
  }

  console.log('Should pay: ' + decision.shouldPay);
  console.log('Reason: ' + decision.reason);

  if (!decision.shouldPay) {
    console.log('Agent decided NOT to pay this cycle.');
    updateJson(balUSDC, neededUSDC, payments, decision.reason, false, null, existing());
    return;
  }

  console.log('Executing payroll...');
  const payNote = NOTE || decision.note || 'PayClaw Payroll - Arc Testnet';
  const tx = await contract.processAllPayouts(payNote);
  console.log('TX submitted: ' + tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block: ' + receipt.blockNumber);

  updateJson(balUSDC, neededUSDC, payments + 1, decision.reason, true, tx.hash, existing());
  console.log('Done.');
}

function existing() {
  try { return JSON.parse(fs.readFileSync('payments.json', 'utf8')); } catch(e) { return {}; }
}

function updateJson(balance, needed, totalPayments, reason, paid, txHash, prev) {
  const cycleNum = (prev.cycle || 0) + (paid ? 1 : 0);
  const now = new Date();
  const nextCycle = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updated = {
    cycle: cycleNum,
    cycle_date: now.toISOString().split('T')[0],
    next_cycle: nextCycle.toISOString().split('T')[0],
    last_payment_tx: txHash || prev.last_payment_tx || null,
    agent_decision: reason,
    paid_this_run: paid,
    contract_balance: balance,
    payroll_needed: needed,
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
