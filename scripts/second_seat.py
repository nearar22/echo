"""Fund a fresh second account from the deployer (plain value transfer, test
plumbing only, not contract logic), then have it fill seat two of r-1 so the
convergence consensus write runs from a different sender than seat one."""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
import patch_status  # noqa: E402
patch_status.apply()
from gl import make_client, load_pk, read_view  # noqa: E402
from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury

TERMINAL = {"ACCEPTED", "FINALIZED", "UNDETERMINED", "CANCELED"}


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    addr = json.load(open(os.path.join(root, "deployment.json")))["address"]
    client, deployer = make_client()

    # A fixed second test key (well-known throwaway, test only).
    second_pk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    second = create_account(account_private_key=second_pk)
    sclient = create_client(chain=testnet_bradbury, account=second)
    print("seat two account:", second.address)

    # Fund the second account with a small amount of GEN for the fee reserve.
    try:
        bal = client.get_balance(second.address)
    except Exception:
        bal = None
    print("seat two balance:", bal)
    try:
        h = client.provider.eth.send_transaction  # noqa
    except Exception:
        pass
    try:
        tx = client.transfer(to=second.address, value=int(3e18))
        print("fund tx:", tx)
        time.sleep(10)
    except Exception as e:
        print("fund note:", e)

    before = read_view(client, deployer, addr, "get_stats")["settled"]
    try:
        tx = sclient.write_contract(address=addr, function_name="answer_round", args=["r-1", "seashell"], value=0)
        print("answer tx:", tx)
    except Exception as e:
        print("answer submit note:", e)

    for i in range(160):
        try:
            now = read_view(client, deployer, addr, "get_stats")["settled"]
        except Exception as e:
            print(f"[{i}] read err {e}")
            time.sleep(8)
            continue
        print(f"[{i}] settled={now}")
        if now > before:
            break
        time.sleep(8)

    r = read_view(client, deployer, addr, "get_round", ["r-1"])
    print("band:", r.get("band"), "proximity:", r.get("proximity"))
    print("wordOne:", r.get("wordOne"), "wordTwo:", r.get("wordTwo"))
    print("link:", str(r.get("link"))[:200])


if __name__ == "__main__":
    main()
