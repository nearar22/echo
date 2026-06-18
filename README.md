# ECHO

```
+------------------------------------------------------+
|  ECHO  -  a cooperative word game for two            |
|  Players: 2 (co-op)   Length: one round   Ages: all  |
|  Dealer: an AI judge   Table: a smart contract       |
+------------------------------------------------------+
```

A quickstart card. Read it the way you would read the rules tucked inside a
board game box. Everything below is exactly what the on-chain contract does.

## SETUP

One player opens a round by setting a connecting PROMPT (for example, "something
you find at the beach") and secretly choosing a single WORD. The contract seals
that word; no one, and no view of the table, can see it while the round waits for
a partner. A second player joins and adds their own single word, blind, without
ever seeing the first. There are no deposits and no stakes; you pay only the
network fee to play.

## GOAL

You win TOGETHER by thinking alike. The two words are revealed at the same
moment, and an AI judge rates how closely they converge in meaning. This is not
a duel. There is no winner and loser at the table, only the pair, and the pair
either echoes or it does not.

## ON YOUR TURN

```
open_round(prompt, first_word)        seat one, blind, seals word one
answer_round(round_id, second_word)   seat two, blind, settles the round
```

A word must be a single token, no spaces (guarded before anything runs). Seat
two must be a different address than seat one; the contract refuses a player
trying to fill both seats. The moment the second word lands, both words flip
face-up together and the judge rules.

## SCORING

The judge reads the prompt and both words as untrusted data (a word that tries
to instruct the judge or claim a perfect match is ignored) and returns one
proximity reading. The contract turns that into a closeness BAND: MATCH for true
convergence, NEAR for a strong associative link, MISS otherwise. A MATCH or a
NEAR counts as a win for the pair.

Validators do not compare raw proximity numbers, which never agree between two
model runs. They agree only on the derived band, computed by deterministic
argmax:

```python
def _closeness_band(readings):
    proximity = int(readings.get("proximity", 0))
    scores = {
        "match": proximity,
        "near": max(0, 100 - abs(proximity - 60)),
        "miss": max(0, 100 - proximity),
    }
    best, best_val = None, -1
    for b in ("match", "near", "miss"):     # fixed order resolves ties identically
        if scores[b] > best_val:
            best_val, best = scores[b], b
    return best

def validator_fn(leaders_res):
    if not isinstance(leaders_res, gl.vm.Return):
        return _handle_leader_error(leaders_res, leader_fn)
    mine = leader_fn()
    theirs = leaders_res.calldata
    if not isinstance(theirs, dict):
        return False
    return _closeness_band(mine["readings"]) == _closeness_band(theirs.get("readings"))

return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

## COMPONENTS

The contract is the whole table. Public round state is stored apart from the
sealed words, and `get_rounds(start)` / `get_round(id)` never return word one
while a round is still awaiting a partner; both words appear only once the round
settles. `get_stats()` reads the table tallies (rounds, settled, wins).

## AT THE TABLE (the frontend)

A two-seat convergence table, not a landing page: two facing seat panels hold
concealed tiles, a prompt banner sits above, and a center burst zone fires when
the tiles flip. Open a round or join an awaiting one from the lobby. The look is
bright dopamine color blocks, the opposite of a dark dashboard. The table reads
the chain directly; an AI write takes a few minutes, and because the installed
client can raise on the submission receipt while the transaction is still live,
the table confirms a result by watching the round flip to settled on-chain
rather than trusting the write to return.

---

Table on-chain at
[`0x8EB3b0855793a2290641B87Ed0Be189304b632C9`](https://explorer-bradbury.genlayer.com/address/0x8EB3b0855793a2290641B87Ed0Be189304b632C9).
First round dealt in transaction
[`0xaa4c7c910f20d1d79acf47977cdc3858ccc33e282fedda317cb6ebd62551c666`](https://explorer-bradbury.genlayer.com/tx/0xaa4c7c910f20d1d79acf47977cdc3858ccc33e282fedda317cb6ebd62551c666).
The full rules as the contract enforces them are in `contracts/contract.py`.
