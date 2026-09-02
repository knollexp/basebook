const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const registry = require("../src/commands/registry");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 = "0x" + "00".repeat(32);

describe("registry", () => {
  test("targets the NameRegistry contract", () => {
    assert.equal(registry.contract, "NameRegistry");
  });

  test("lookup reports a held name", async () => {
    const contract = { ownerOf: async () => ADDR };
    const result = await registry.actions.lookup.run({ contract, args: ["alice"] });
    assert.equal(result.name, "alice");
    assert.equal(result.owner, ADDR);
    assert.equal(result.available, false);
  });

  test("lookup reports a free name as available rather than owned by zero", async () => {
    const contract = { ownerOf: async () => ZERO_ADDRESS };
    const result = await registry.actions.lookup.run({ contract, args: ["free"] });
    assert.equal(result.owner, null);
    assert.equal(result.available, true);
  });

  test("lookup encodes the name it queries", async () => {
    let seen;
    const contract = {
      ownerOf: async (key) => {
        seen = key;
        return ZERO_ADDRESS;
      },
    };
    await registry.actions.lookup.run({ contract, args: ["alice"] });
    assert.equal(seen, ethers.encodeBytes32String("alice"));
  });

  test("of decodes the name back to text", async () => {
    const contract = { nameOf: async () => ethers.encodeBytes32String("alice") };
    const result = await registry.actions.of.run({ contract, args: [ADDR] });
    assert.equal(result.name, "alice");
  });

  test("of reports no name rather than an empty string", async () => {
    const contract = { nameOf: async () => ZERO_BYTES32 };
    assert.equal((await registry.actions.of.run({ contract, args: [ADDR] })).name, null);
  });

  test("release takes no argument", async () => {
    const contract = {
      release: async () => ({
        hash: "0x1",
        wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }),
      }),
    };
    assert.equal((await registry.actions.release.run({ contract })).status, "success");
  });
});
