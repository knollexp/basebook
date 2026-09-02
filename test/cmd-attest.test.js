const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const attest = require("../src/commands/attest");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";
const HASH = "0x" + "ab".repeat(32);

describe("attest", () => {
  test("targets the Attestation contract", () => {
    assert.equal(attest.contract, "Attestation");
  });

  test("check reports an existing attestation", async () => {
    const contract = { attestedAt: async () => 1700000000n };
    const result = await attest.actions.check.run({ contract, args: [HASH, ADDR] });
    assert.equal(result.attested, true);
    assert.equal(result.attestedAt, "2023-11-14T22:13:20Z");
  });

  test("check treats a zero timestamp as never attested", async () => {
    const contract = { attestedAt: async () => 0n };
    const result = await attest.actions.check.run({ contract, args: [HASH, ADDR] });
    assert.equal(result.attested, false);
    assert.equal(result.attestedAt, "-");
  });

  test("check refuses a digest that is not a 32-byte hash", async () => {
    await assert.rejects(
      () => attest.actions.check.run({ contract: {}, args: ["alice", ADDR] }),
      /must be a 32-byte hex hash/
    );
  });

  test("check needs an attester", async () => {
    await assert.rejects(
      () => attest.actions.check.run({ contract: {}, args: [HASH] }),
      /Missing <attester>/
    );
  });

  test("add passes the digest through unchanged", async () => {
    let seen;
    const contract = {
      attest: async (d) => {
        seen = d;
        return { hash: "0x1", wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }) };
      },
    };
    await attest.actions.add.run({ contract, args: [HASH] });
    assert.equal(seen, HASH);
  });
});
