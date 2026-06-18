"""Open a round with a blind first word, then answer with a second word (the AI
consensus write). Confirms the convergence round seals both words and rules a
co-op closeness band, and that the first word stays hidden while awaiting."""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
import patch_status  # noqa: E402
patch_status.apply()
from gl import make_client, read_view  # noqa: E402

TERMINAL = {"ACCEPTED", "FINALIZED", "UNDETERMINED", "CANCELED"}


def wait(client, tx, label):
    for i in range(160):
        try:
            t = client.get_transaction(transaction_hash=tx)
        except Exception as e:
            print(f"[{label} {i}] err {e}", flush=True)
            time.sleep(8)
            continue
        name = t.get("status_name") or t.get("status") if isinstance(t, dict) else None
        ex = t.get("tx_execution_result_name") if isinstance(t, dict) else None
        print(f"[{label} {i}] status={name} exec={ex}", flush=True)
        if str(name) in TERMINAL:
            return
        time.sleep(8)


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    addr = json.load(open(os.path.join(root, "deployment.json")))["address"]
    client, account = make_client()
    print("addr:", addr)

    try:
        tx = client.write_contract(address=addr, function_name="open_round", args=["Something you find at the beach", "shell"], value=0)
        print("open tx:", tx)
        wait(client, tx, "open")
    except Exception as e:
        print("open submit note:", e)
    time.sleep(3)
    # While awaiting, the first word must be hidden.
    r = read_view(client, account, addr, "get_round", ["r-1"])
    print("while awaiting -> status:", r.get("status"), "wordOne leaked?:", repr(r.get("wordOne")))

    try:
        tx = client.write_contract(address=addr, function_name="answer_round", args=["r-1", "seashell"], value=0)
        print("answer tx:", tx)
        wait(client, tx, "answer")
    except Exception as e:
        print("answer submit note:", e)

    print("\nstats:", json.dumps(read_view(client, account, addr, "get_stats"), default=str))
    r = read_view(client, account, addr, "get_round", ["r-1"])
    print("settled -> band:", r.get("band"), "proximity:", r.get("proximity"))
    print("wordOne:", r.get("wordOne"), "wordTwo:", r.get("wordTwo"))
    print("link:", str(r.get("link"))[:200])


if __name__ == "__main__":
    main()
