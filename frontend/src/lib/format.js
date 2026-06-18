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
  if (!w) return 'Enter a single word.';
  if (/\s/.test(w)) return 'A word is a single token, no spaces.';
  return null;
}
