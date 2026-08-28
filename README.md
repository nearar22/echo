# Echo

### A fixed-partner semantic convergence game settled by GenLayer

[![GenLayer](https://img.shields.io/badge/GenLayer-Intelligent%20Contract-ff5d8f)](https://genlayer.com)
[![Network](https://img.shields.io/badge/network-StudioNet-2ad4c0)](https://studio.genlayer.com)
[![Tests](https://img.shields.io/badge/contract%20tests-5%20passing-2ad4c0)](#verification)

Echo turns a simple word game into an auditable two-wallet protocol. An opener publishes a connecting prompt, seals one word, and binds a specific wallet to seat two. The invited partner answers without seeing the first word through the public interface. GenLayer validators then judge how closely both words converge and settle a `match`, `near`, or `miss` verdict on-chain.

## Why GenLayer is essential

A conventional contract can compare hashes or exact strings, but it cannot decide whether `ocean` and `sea` express the same idea. Echo asks validators to evaluate meaning under a published rubric. Consensus verifies the score band and requires a concrete semantic explanation, making the judgment reproducible and reviewable rather than decorative AI output.

## Lifecycle

1. Seat one generates a random nonce locally and calls `open_round(prompt, sha256(word:nonce), invited_wallet)`; the word never appears in the opening transaction or contract state.
2. Seat two answers the committed round without access to the first word or nonce.
3. Seat one calls `reveal_round(round_id, first_word, nonce)`. The contract verifies the SHA-256 commitment before consensus can run.
3. Only `invited_wallet` can call `answer_round`; outsiders and the opener cannot take seat two.
4. Validators independently evaluate semantic proximity under exact thresholds.
5. Settlement reveals both words, the proximity score, verdict band, explanation, and validator-audit record.

| Band | Score | Meaning |
|---|---:|---|
| Match | 85–100 | Identical, synonymous, or exceptionally tight convergence |
| Near | 55–84 | Clear and specific association |
| Miss | 0–54 | Broad category overlap, weak association, or no useful link |

## Safety properties

- Fixed seat-two authorization prevents answer front-running.
- One active awaiting round per opener limits round spam.
- Strict prompt, wallet, and single-token word validation runs on-chain.
- User strings are treated as evidence, never instructions to the judge.
- Validator consensus checks thresholds, semantic linkage, contradictions, and prompt injection.
- Words become public only when a valid invited response settles the round.

## Verification

```bash
python -m pytest -q
cd frontend
npm run build
```

The contract suite covers commitment validation, fixed-seat authorization, pre-reveal word withholding, invalid-reveal rejection, opener-only reveal, and consensus settlement.

## Deployment

- Network: GenLayer StudioNet (`61999`)
- Contract: [`0x51e0163e89908E6d35e3B5E914E68C345AfEE56C`](https://explorer-studio.genlayer.com/address/0x51e0163e89908E6d35e3B5E914E68C345AfEE56C)
- Deploy transaction: [`0xe79c9c8d9f5b85d65f08918d1cc0068b4ddd46abe2b0f0478fbfc766f3a95929`](https://explorer-studio.genlayer.com/tx/0xe79c9c8d9f5b85d65f08918d1cc0068b4ddd46abe2b0f0478fbfc766f3a95929)

## Repository map

```text
contracts/   Intelligent contract
frontend/    React/Vite application
scripts/     StudioNet deployment and live verification
tests/       Direct contract regression suite
```

MIT licensed.
