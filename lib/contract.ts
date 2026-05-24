// PayClaw contract config — Arc Testnet
export const CONTRACT = '0x0000000000000000000000000000000000000000'; // replace with deployed address
export const ARC_RPC   = 'https://rpc.arc.testnet.circle.com';
export const EXPLORER  = 'https://testnet.arcscan.app';

export function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
