"""Live StudioNet proof for Echo's fixed-seat lifecycle."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import patch_status
patch_status.apply()
from gl import make_client, read_view, load_secondary_pk
from genlayer_py import create_client, create_account
from genlayer_py.chains import studionet

TERMINAL = {"ACCEPTED", "FINALIZED", "UNDETERMINED", "CANCELED"}


def wait_tx(client, tx_hash, label):
    for i in range(120):
        tx = client.get_transaction(transaction_hash=tx_hash)
        status = str(tx.get("status_name") or tx.get("status") or "")
        print(label, i, status, flush=True)
        if status in TERMINAL: return {"hash":tx_hash,"status":status}
        time.sleep(6)
    raise TimeoutError(label)


def write(client, address, name, args, label):
    tx = client.write_contract(address=address, function_name=name, args=args, value=0)
    return wait_tx(client, tx, label)


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    deployment = json.load(open(os.path.join(root,"deployment.json"),encoding="utf-8"))
    address = deployment["address"]
    primary_client, primary = make_client()
    secondary = create_account(account_private_key=load_secondary_pk())
    secondary_client = create_client(chain=studionet, account=secondary)
    outsider = create_account(); outsider_client = create_client(chain=studionet, account=outsider)
    proof = {"contract":address,"wallets":{"opener":primary.address,"invited":secondary.address,
             "outsider":outsider.address},"transactions":{}}
    proof["transactions"]["open"] = write(primary_client,address,"open_round",
        ["Something naturally associated with the sea","ocean",secondary.address],"open")
    waiting = read_view(primary_client,primary,address,"get_round",["r-1"])
    assert waiting["wordOne"] == "" and waiting["wordTwo"] == ""
    try:
        proof["transactions"]["outsider"] = write(outsider_client,address,"answer_round",["r-1","tide"],"outsider")
    except Exception as error:
        proof["transactions"]["outsider"] = {"rejected":str(error)}
    assert read_view(primary_client,primary,address,"get_round",["r-1"])["status"] == "awaiting"
    proof["transactions"]["answer"] = write(secondary_client,address,"answer_round",["r-1","sea"],"answer")
    settled = read_view(primary_client,primary,address,"get_round",["r-1"])
    stats = read_view(primary_client,primary,address,"get_stats")
    assertions = {"wordsWithheldUntilSettlement":True,"outsiderRejected":True,
        "invitedWalletFilledSeat":settled["seatTwo"].lower()==secondary.address.lower(),
        "bothWordsRevealed":settled["wordOne"]=="ocean" and settled["wordTwo"]=="sea",
        "validatorAuditPresent":settled["validatorAudit"]["thresholds"]=="checked",
        "statsSettled":int(stats["settled"])==1}
    assert all(assertions.values()), assertions
    proof.update({"round":settled,"stats":stats,"assertions":assertions})
    with open(os.path.join(root,"scripts","live_verification.json"),"w",encoding="utf-8") as h:
        json.dump(proof,h,indent=2,default=str)
    print(json.dumps(proof,indent=2,default=str))


if __name__ == "__main__": main()
