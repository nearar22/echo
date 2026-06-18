import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESS = '0x8EB3b0855793a2290641B87Ed0Be189304b632C9';
export const DEPLOY_TX = '0xaa4c7c910f20d1d79acf47977cdc3858ccc33e282fedda317cb6ebd62551c666';
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const RPC_URL = 'https://rpc-bradbury.genlayer.com';
export const NETWORK_NAME = 'Bradbury';
export const CHAIN_ID = 4221;
export const CHAIN_ID_HEX = '0x107D';

export const addressUrl = (addr) => `${EXPLORER}/address/${addr}`;
export const txUrl = (hash) => `${EXPLORER}/tx/${hash}`;

// Closeness bands map the judge's verdict to one of three readings.
// Colors track the Dopamine art direction: a magenta burst on a match, teal on
// a near echo, a muted version on a miss. match and near are co-op WINS.
export const BANDS = {
  match: {
    key: 'match',
    label: 'Match',
    verb: 'A perfect echo',
    color: '#ff5d8f',
    soft: '#ff86ab',
    glow: 'rgba(255, 93, 143, 0.55)',
    win: true,
  },
  near: {
    key: 'near',
    label: 'Near',
    verb: 'A near echo',
    color: '#2ad4c0',
    soft: '#74e6d8',
    glow: 'rgba(42, 212, 192, 0.5)',
    win: true,
  },
  miss: {
    key: 'miss',
    label: 'Miss',
    verb: 'The echo faded',
    color: '#b8a6c4',
    soft: '#d4c8db',
    glow: 'rgba(184, 166, 196, 0.45)',
    win: false,
  },
};

export const bandOf = (band) => BANDS[String(band)] || BANDS.miss;

export const readClient = createClient({ chain: testnetBradbury });
export const makeWalletClient = (account) => createClient({ chain: testnetBradbury, account });

// Reads can hit transient RPC errors; retry with exponential backoff.
export async function withRpcRetry(fn, tries = 5) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|ECONN|503|502|gateway/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw last;
}

// ----- value coercion (the SDK can return Map / bigint shapes) -------------

function asNumber(v) {
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function asString(v) {
  return v === undefined || v === null ? '' : String(v);
}
function pick(obj, key) {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return obj[key];
  return undefined;
}
function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v instanceof Map) return Array.from(v.values());
  return [];
}

// ----- normalizers ---------------------------------------------------------

// A round. While status is "awaiting", wordOne and wordTwo come back as empty
// strings from the chain (sealed). Both flip face-up together at settlement.
export function normRound(raw) {
  const proximity = asNumber(pick(raw, 'proximity'));
  return {
    id: asString(pick(raw, 'id')),
    prompt: asString(pick(raw, 'prompt')),
    status: asString(pick(raw, 'status')) || 'awaiting',
    seatOne: asString(pick(raw, 'seatOne')),
    seatTwo: asString(pick(raw, 'seatTwo')),
    band: asString(pick(raw, 'band')),
    proximity,
    link: asString(pick(raw, 'link')),
    wordOne: asString(pick(raw, 'wordOne')),
    wordTwo: asString(pick(raw, 'wordTwo')),
    seq: asNumber(pick(raw, 'seq')),
  };
}

// ----- view reads -----------------------------------------------------------

async function readView(functionName, args = []) {
  return withRpcRetry(() => readClient.readContract({ address: CONTRACT_ADDRESS, functionName, args }));
}

export async function fetchStats() {
  const raw = await readView('get_stats');
  return {
    rounds: asNumber(pick(raw, 'rounds')),
    settled: asNumber(pick(raw, 'settled')),
    wins: asNumber(pick(raw, 'wins')),
  };
}

// Walk the paged view (PAGE = 20, newest first) until a short page returns.
export async function fetchAllRounds() {
  const out = [];
  let start = 0;
  for (let guard = 0; guard < 200; guard++) {
    const page = asArray(await readView('get_rounds', [start])).map(normRound);
    out.push(...page);
    if (page.length < 20) break;
    start += page.length;
  }
  return out;
}

export async function fetchRound(id) {
  return normRound(await readView('get_round', [id]));
}
