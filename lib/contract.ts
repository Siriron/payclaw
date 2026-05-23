export const CONTRACT  = '0x6263d965f8753cdEE92CCCC53e2C2B1066287f63';
export const EXPLORER  = 'https://testnet.arcscan.app/tx/';
export const ARC_RPC   = 'https://rpc.testnet.arc.network';
export const ARC_CHAIN = 1891;

export const ARC_CHAIN_HEX = '0x' + ARC_CHAIN.toString(16);

export const ARC_NETWORK_PARAMS = {
  chainId: ARC_CHAIN_HEX,
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 18 },
  rpcUrls: [ARC_RPC],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

export const ARC_TESTNET_KIT = {
  id: ARC_CHAIN,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
};

export const ABI = [
  {"inputs":[{"internalType":"address","name":"_aiAgent","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newAgent","type":"address"}],"name":"AgentUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"funder","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ContractFunded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"workerId","type":"uint256"},{"indexed":false,"internalType":"address","name":"wallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"note","type":"string"}],"name":"PayoutProcessed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"workerId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"wallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"salary","type":"uint256"}],"name":"WorkerAdded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"workerId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newSalary","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isActive","type":"bool"}],"name":"WorkerUpdated","type":"event"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"address","name":"_wallet","type":"address"},{"internalType":"uint256","name":"_salary6","type":"uint256"}],"name":"addWorker","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"aiAgent","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getPayment","outputs":[{"components":[{"internalType":"uint256","name":"workerId","type":"uint256"},{"internalType":"address","name":"wallet","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"note","type":"string"}],"internalType":"struct ArcPayrollAgent.PaymentRecord","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getTotalPayments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getTotalPayrollNeeded","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_workerId","type":"uint256"}],"name":"getWorker","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"wallet","type":"address"},{"internalType":"uint256","name":"salaryPerCycle","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"totalPaid","type":"uint256"},{"internalType":"uint256","name":"lastPaidAt","type":"uint256"}],"internalType":"struct ArcPayrollAgent.Worker","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"paymentHistory","outputs":[{"internalType":"uint256","name":"workerId","type":"uint256"},{"internalType":"address","name":"wallet","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"note","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_note","type":"string"}],"name":"processAllPayouts","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_workerId","type":"uint256"},{"internalType":"string","name":"_note","type":"string"}],"name":"processPayout","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_newAgent","type":"address"}],"name":"setAiAgent","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_workerId","type":"uint256"},{"internalType":"uint256","name":"_newSalary6","type":"uint256"},{"internalType":"bool","name":"_isActive","type":"bool"}],"name":"updateWorker","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"workerCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"workers","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"wallet","type":"address"},{"internalType":"uint256","name":"salaryPerCycle","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"totalPaid","type":"uint256"},{"internalType":"uint256","name":"lastPaidAt","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];

// Utilities
export function short(addr: string | undefined | null): string {
  if (!addr) return '—';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

export function fmtUsdc(val: bigint | string, decimals = 18): string {
  try {
    const n = typeof val === 'string' ? BigInt(val) : val;
    return (Number(n) / 10 ** decimals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch { return '0.00'; }
}

export function timeAgo(ts: bigint | number): string {
  const sec = Math.floor((Date.now() - Number(ts) * 1000) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return new Date(Number(ts) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function parseContractError(e: any): string {
  const msg = e?.reason || e?.data?.message || e?.message || 'Transaction failed';
  if (msg.includes('insufficient')) return 'Insufficient USDC in contract';
  if (msg.toLowerCase().includes('not owner') || msg.toLowerCase().includes('only owner') || msg.toLowerCase().includes('caller is not')) return 'Owner wallet required';
  if (msg.includes('rejected')) return 'Transaction rejected';
  if (msg.includes('chain')) return 'Switch to Arc Testnet (Chain 1891)';
  return msg.length > 80 ? msg.slice(0, 80) + '…' : msg;
}
