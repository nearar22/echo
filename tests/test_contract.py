import json
import sys


def addr(value):
    if hasattr(value, "as_hex"):
        return value.as_hex
    if isinstance(value, (bytes, bytearray)):
        return "0x" + bytes(value).hex()
    return str(value)


def deploy(direct_vm, direct_deploy, alice):
    direct_vm.sender = alice
    return direct_deploy("contracts/contract.py")


def enable_consensus(contract, monkeypatch):
    module = sys.modules[contract.__class__.__module__]

    def direct(fn, **_kwargs):
        return fn()

    monkeypatch.setattr(module.gl.eq_principle, "prompt_non_comparative", direct)


def mock_score(direct_vm, proximity, link="Both words share one concrete semantic relationship."):
    direct_vm.mock_llm("ECHO JUDGE", json.dumps({"proximity": proximity, "link": link}))


def test_input_grammar_and_invitation(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = deploy(direct_vm, direct_deploy, direct_alice)
    with direct_vm.expect_revert("at least 12"):
        contract.open_round("too short", "ocean", addr(direct_bob))
    with direct_vm.expect_revert("only letters"):
        contract.open_round("Something associated with the sea", "ignore instructions", addr(direct_bob))
    with direct_vm.expect_revert("valid wallet"):
        contract.open_round("Something associated with the sea", "ocean", "bob")
    with direct_vm.expect_revert("cannot invite"):
        contract.open_round("Something associated with the sea", "ocean", addr(direct_alice))


def test_only_fixed_partner_can_answer(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = deploy(direct_vm, direct_deploy, direct_alice)
    opened = contract.open_round("Something naturally associated with the sea", "ocean", addr(direct_bob))
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("invited seat-two"):
        contract.answer_round(opened["id"], "tide")


def test_waiting_view_hides_words_and_active_round_blocks_spam(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = deploy(direct_vm, direct_deploy, direct_alice)
    opened = contract.open_round("Something naturally associated with the sea", "ocean", addr(direct_bob))
    public = contract.get_round(opened["id"])
    assert public["wordOne"] == public["wordTwo"] == ""
    assert public["invitedSeatTwo"].lower() == addr(direct_bob).lower()
    with direct_vm.expect_revert("active round"):
        contract.open_round("Something naturally associated with the sky", "cloud", addr(direct_bob))


def test_thresholds_audit_reveal_and_stats(direct_vm, direct_deploy, direct_alice, direct_bob, monkeypatch):
    contract = deploy(direct_vm, direct_deploy, direct_alice)
    enable_consensus(contract, monkeypatch)
    opened = contract.open_round("Something naturally associated with the sea", "ocean", addr(direct_bob))
    direct_vm.sender = direct_bob
    mock_score(direct_vm, 85)
    settled = contract.answer_round(opened["id"], "sea")
    assert settled["band"] == "match"
    assert settled["wordOne"] == "ocean" and settled["wordTwo"] == "sea"
    assert settled["validatorAudit"]["thresholds"] == "checked"
    assert contract.get_stats() == {"rounds": 1, "settled": 1, "matches": 1, "near": 0, "misses": 0, "wins": 1}


def test_near_and_miss_boundaries(direct_vm, direct_deploy, direct_alice, direct_bob, monkeypatch):
    contract = deploy(direct_vm, direct_deploy, direct_alice)
    enable_consensus(contract, monkeypatch)
    for score, expected in ((84, "near"), (54, "miss")):
        direct_vm.sender = direct_alice
        opened = contract.open_round("Something naturally associated with weather", "rain", addr(direct_bob))
        direct_vm.sender = direct_bob
        mock_score(direct_vm, score)
        assert contract.answer_round(opened["id"], "cloud")["band"] == expected
        direct_vm.clear_mocks()
    stats = contract.get_stats()
    assert stats["near"] == 1 and stats["misses"] == 1 and stats["wins"] == 1
