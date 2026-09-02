const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const badge = require("../src/commands/badge");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";

describe("badge", () => {
  test("targets the BuilderBadge contract", () => {
    assert.equal(badge.contract, "BuilderBadge");
  });

  test("show reads the metadata and total", async () => {
    const contract = {
      name: async () => "Base Builder Badge",
      symbol: async () => "BBB",
      totalClaimed: async () => 3n,
    };
    assert.deepEqual(await badge.actions.show.run({ contract }), {
      name: "Base Builder Badge",
      symbol: "BBB",
      totalClaimed: 3n,
    });
  });

  test("status formats the claim time", async () => {
    const contract = { claimed: async () => true, claimedAt: async () => 1700000000n };
    const result = await badge.actions.status.run({ contract, args: [ADDR] });
    assert.equal(result.claimed, true);
    assert.equal(result.claimedAt, "2023-11-14T22:13:20Z");
  });

  test("status renders an unclaimed address as a dash, not the epoch", async () => {
    const contract = { claimed: async () => false, claimedAt: async () => 0n };
    const result = await badge.actions.status.run({ contract, args: [ADDR] });
    assert.equal(result.claimed, false);
    assert.equal(result.claimedAt, "-");
  });

  test("status rejects a non-address", async () => {
    await assert.rejects(
      () => badge.actions.status.run({ contract: {}, args: ["x"] }),
      /not an address/
    );
  });

  test("claim is the only write action", () => {
    assert.equal(badge.actions.show.write, undefined);
    assert.equal(badge.actions.status.write, undefined);
    assert.equal(badge.actions.claim.write, true);
  });
});
