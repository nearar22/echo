import hashlib, json, sys
def addr(v):
    if hasattr(v,"as_hex"): return v.as_hex
    if isinstance(v,(bytes,bytearray)): return "0x"+bytes(v).hex()
    return str(v)
def commit(word,nonce): return hashlib.sha256((word+":"+nonce).encode()).hexdigest()
def deploy(vm,factory,alice): vm.sender=alice; return factory("contracts/contract.py")
def consensus(c,monkeypatch):
    module=sys.modules[c.__class__.__module__]; monkeypatch.setattr(module.gl.eq_principle,"prompt_non_comparative",lambda fn,**kw:fn())
def mock(vm,score): vm.mock_llm("ECHO JUDGE",json.dumps({"proximity":score,"link":"Both words share one concrete semantic relationship."}))
def test_commitment_and_invitation_guards(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_vm,direct_deploy,direct_alice)
    with direct_vm.expect_revert("SHA-256"): c.open_round("Something associated with the sea","ocean",addr(direct_bob))
    with direct_vm.expect_revert("valid wallet"): c.open_round("Something associated with the sea",commit("ocean","n"),"bob")
def test_outsider_blocked_and_words_hidden(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
    c=deploy(direct_vm,direct_deploy,direct_alice); r=c.open_round("Something naturally associated with the sea",commit("ocean","secret"),addr(direct_bob))
    direct_vm.sender=direct_charlie
    with direct_vm.expect_revert("invited seat-two"): c.answer_round(r["id"],"tide")
def test_commit_reveal_settlement(direct_vm,direct_deploy,direct_alice,direct_bob,monkeypatch):
    c=deploy(direct_vm,direct_deploy,direct_alice); consensus(c,monkeypatch); r=c.open_round("Something naturally associated with the sea",commit("ocean","secret"),addr(direct_bob))
    direct_vm.sender=direct_bob; assert c.answer_round(r["id"],"sea")["status"]=="awaiting_reveal"; assert c.get_round(r["id"])["wordTwo"]==""
    direct_vm.sender=direct_alice
    with direct_vm.expect_revert("does not match"): c.reveal_round(r["id"],"ocean","wrong")
    mock(direct_vm,95); settled=c.reveal_round(r["id"],"ocean","secret")
    assert settled["wordOne"]=="ocean" and settled["wordTwo"]=="sea" and settled["validatorAudit"]["commitmentVerified"] is True
def test_only_opener_reveals(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_vm,direct_deploy,direct_alice); r=c.open_round("Something naturally associated with weather",commit("rain","salt"),addr(direct_bob)); direct_vm.sender=direct_bob; c.answer_round(r["id"],"cloud")
    with direct_vm.expect_revert("Only seat one"): c.reveal_round(r["id"],"rain","salt")
