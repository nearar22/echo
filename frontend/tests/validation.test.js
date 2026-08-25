import test from 'node:test';
import assert from 'node:assert/strict';
import { promptError, wordError, walletError, sameAddr } from '../src/lib/format.js';

test('contract-aligned prompt and word validation', () => {
  assert.ok(promptError('too short'));
  assert.equal(promptError('Something linked to the sea'), null);
  assert.ok(wordError('two words'));
  assert.ok(wordError('x'));
  assert.equal(wordError("mother-in-law"), null);
});

test('wallet validation and comparison are case insensitive', () => {
  const wallet = '0x1234567890abcdef1234567890abcdef12345678';
  assert.equal(walletError(wallet), null);
  assert.ok(walletError('0x1234'));
  assert.equal(sameAddr(wallet, wallet.toUpperCase()), true);
});
