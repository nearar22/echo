"""Deploy Echo to StudioNet with a locally signed transaction."""
import json, os, sys, time
import requests, rlp
sys.path.insert(0, os.path.dirname(__file__))
from gl import make_client
from genlayer_py.abi import calldata
from genlayer_py.abi.transactions import serialize
from genlayer_py.chains import studionet
from genlayer_py.contracts.actions import _encode_add_transaction_data, ADDRESS_ZERO
from genlayer_py.contracts.utils import make_calldata_object

RPC, API = "https://studio.genlayer.com/api", "https://explorer-studio.genlayer.com/api"
ROOT = os.path.dirname(os.path.dirname(__file__))


def transactions(address):
    r = requests.get(API + "/transactions", params={"search":address,"limit":100},
                     headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
    r.raise_for_status(); body = r.json()
    return body.get("transactions") or body.get("data") or []


def next_nonce(address):
    values = []
    for item in transactions(address):
        raw = (((item.get("data") or {}).get("sim_config") or {}).get("signed_rollup_transaction"))
        if raw: values.append(int.from_bytes(rlp.decode(bytes.fromhex(raw.removeprefix("0x")))[0], "big"))
    return max(values) + 1 if values else 0


def main():
    client, account = make_client()
    code = open(os.path.join(ROOT, "contracts", "contract.py"), encoding="utf-8").read()
    before = {x["hash"] for x in transactions(account.address)}
    payload = serialize([code, calldata.encode(make_calldata_object(method=None,args=[],kwargs=None)), False])
    data = _encode_add_transaction_data(client, account, ADDRESS_ZERO,
        studionet.default_consensus_max_rotations, payload)
    tx = {"from":account.address,"nonce":next_nonce(account.address),"data":data,
          "to":studionet.consensus_main_contract["address"],"value":0,"gasPrice":0,
          "gas":500000,"chainId":studionet.id}
    raw = "0x" + account.sign_transaction(tx).raw_transaction.hex()
    r = requests.post(RPC, json={"jsonrpc":"2.0","id":1,"method":"eth_sendRawTransaction","params":[raw]},
                      headers={"User-Agent":"Mozilla/5.0"}, timeout=45)
    r.raise_for_status(); sent = r.json()
    if sent.get("error"): raise RuntimeError(sent["error"])
    print("Deployer:", account.address, "rollup:", sent.get("result"), flush=True)
    found = None
    for i in range(180):
        candidates = [x for x in transactions(account.address)
                      if x.get("hash") not in before and bool((x.get("data") or {}).get("contract_code"))]
        if candidates:
            found = candidates[0]; status = str(found.get("status"))
            print(i, status, found.get("hash"), found.get("to_address"), flush=True)
            if status in {"ACCEPTED","FINALIZED","UNDETERMINED","CANCELED"}:
                if status not in {"ACCEPTED","FINALIZED"}: raise RuntimeError("Deployment ended " + status)
                break
        time.sleep(5)
    if not found: raise TimeoutError("Deployment was not found")
    output = {"network":"studionet","chainId":61999,"tx":found["hash"],
              "address":found["to_address"],"explorer":"https://explorer-studio.genlayer.com"}
    with open(os.path.join(ROOT,"deployment.json"),"w",encoding="utf-8") as h: json.dump(output,h,indent=2)
    print(json.dumps(output, indent=2))


if __name__ == "__main__": main()
