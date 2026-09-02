const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const kv = require("../src/commands/kv");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";

describe("kv", () => {
  test("targets the KeyValueStore contract", () => {
    assert.equal(kv.contract, "KeyValueStore");
  });

  test("get decodes the key it reports", async () => {
    const contract = { get: async () => "dark" };
    const result = await kv.actions.get.run({ contract, args: [ADDR, "theme"] });
    assert.equal(result.key, "theme");
    assert.equal(result.value, "dark");
    assert.equal(result.empty, false);
  });

  test("get encodes the key it queries", async () => {
    let seen;
    const contract = {
      get: async (_owner, key) => {
        seen = key;
        return "";
      },
    };
    await kv.actions.get.run({ contract, args: [ADDR, "theme"] });
    assert.equal(seen, ethers.encodeBytes32String("theme"));
  });

  test("get flags an empty value without claiming it is unset", async () => {
    const contract = { get: async () => "" };
    const result = await kv.actions.get.run({ contract, args: [ADDR, "theme"] });
    assert.equal(result.value, "");
    assert.equal(result.empty, true);
  });

  test("get checksums the owner", async () => {
    const contract = { get: async () => "x" };
    const result = await kv.actions.get.run({ contract, args: [ADDR.toLowerCase(), "k"] });
    assert.equal(result.owner, ADDR);
  });

  test("set needs both a key and a value", async () => {
    await assert.rejects(
      () => kv.actions.set.run({ contract: {}, args: ["k"] }),
      /Missing <value>/
    );
  });

  test("set accepts a long value", async () => {
    let seen;
    const contract = {
      set: async (_key, value) => {
        seen = value;
        return { hash: "0x1", wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }) };
      },
    };
    await kv.actions.set.run({ contract, args: ["k", "x".repeat(500)] });
    assert.equal(seen.length, 500);
  });
});
