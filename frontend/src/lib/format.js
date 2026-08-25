export function shortAddr(addr) {
  if (!addr) return '';
  const s = String(addr);
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}

// Same-address check, case-insensitive, for the seat-two guard in the UI.
export function sameAddr(a, b) {
  if (!a || !b) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

// A word is a single token: no spaces. Returns a cleaned single token, used
// only for client-side validation feedback (the contract is the source of
// truth and re-validates).
export function cleanWord(raw) {
  return String(raw || '').trim();
}

export function wordError(raw) {
  const w = cleanWord(raw);
  if (w.length < 2) return 'Use at least 2 characters.';
  if (w.length > 30) return 'Keep the word under 31 characters.';
  if (!/^[a-zA-Z0-9'-]+$/.test(w)) return 'Use one word: letters, numbers, apostrophes, or hyphens.';
  return null;
}

export function promptError(raw) {
  const value = cleanWord(raw);
  if (value.length < 12) return 'Describe the connection in at least 12 characters.';
  if (value.length > 200) return 'Keep the prompt under 201 characters.';
  return null;
}

export function walletError(raw) {
  return /^0x[0-9a-fA-F]{40}$/.test(String(raw || '').trim()) ? null : 'Enter a valid 0x wallet address.';
}
