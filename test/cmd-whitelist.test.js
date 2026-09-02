const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const whitelist = require("../src/commands/whitelist");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";
const tx = () => ({ hash: "0x1", wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }) });

describe("whitelist", () => {
  test("targets the Whitelist contract", () => {
    assert.equal(whitelist.contract, "Whitelist");
  });

  test("owner reads the owner", async () => {
    const contract = { owner: async () => ADDR };
    assert.deepEqual(await whitelist.actions.owner.run({ contract }), { owner: ADDR });
  });

  test("check reports an allowed address", async () => {
    const contract = { allowed: async () => true };
    assert.deepEqual(await whitelist.actions.check.run({ contract, args: [ADDR] }), {
      address: ADDR,
      allowed: true,
    });
  });

  test("check reports a disallowed address as false, not missing", async () => {
    const contract = { allowed: async () => false };
    assert.equal((await whitelist.actions.check.run({ contract, args: [ADDR] })).allowed, false);
  });

  test("allow and revoke both checksum their argument", async () => {
    const seen = [];
    const contract = {
      allow: async (a) => {
        seen.push(a);
        return tx();
      },
      revoke: async (a) => {
        seen.push(a);
        return tx();
      },
    };
    await whitelist.actions.allow.run({ contract, args: [ADDR.toLowerCase()] });
    await whitelist.actions.revoke.run({ contract, args: [ADDR.toLowerCase()] });
    assert.deepEqual(seen, [ADDR, ADDR]);
  });

  test("marks only the mutating actions as writes", () => {
    assert.equal(whitelist.actions.owner.write, undefined);
    assert.equal(whitelist.actions.check.write, undefined);
    assert.equal(whitelist.actions.allow.write, true);
    assert.equal(whitelist.actions.revoke.write, true);
  });
});
