const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const guestbook = require("../src/commands/guestbook");

const AUTHOR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";

/** A guestbook holding `n` entries, newest last. */
const stub = (n) => ({
  total: async () => BigInt(n),
  entryAt: async (i) => {
    if (i < 0n || i >= BigInt(n)) throw new Error("out of bounds");
    return { author: AUTHOR, timestamp: 1700000000n + i, message: `entry ${i}` };
  },
});

describe("guestbook", () => {
  test("targets the Guestbook contract", () => {
    assert.equal(guestbook.contract, "Guestbook");
  });

  test("total counts the entries", async () => {
    assert.deepEqual(await guestbook.actions.total.run({ contract: stub(3) }), { total: 3n });
  });

  test("read returns one entry", async () => {
    const result = await guestbook.actions.read.run({ contract: stub(3), args: ["1"] });
    assert.equal(result.message, "entry 1");
    assert.equal(result.author, AUTHOR);
  });

  test("read rejects a non-numeric index", async () => {
    await assert.rejects(
      () => guestbook.actions.read.run({ contract: stub(3), args: ["x"] }),
      /whole number/
    );
  });

  test("list returns the newest entry first", async () => {
    const rows = await guestbook.actions.list.run({ contract: stub(3), flags: {} });
    assert.equal(rows[0].index, 2n);
    assert.equal(rows[rows.length - 1].index, 0n);
  });

  test("list caps at the limit", async () => {
    const rows = await guestbook.actions.list.run({ contract: stub(30), flags: { limit: "5" } });
    assert.equal(rows.length, 5);
    assert.equal(rows[0].index, 29n);
    assert.equal(rows[4].index, 25n);
  });

  test("list returns nothing for an empty guestbook", async () => {
    assert.deepEqual(await guestbook.actions.list.run({ contract: stub(0), flags: {} }), []);
  });

  test("list does not underflow when there are fewer entries than the limit", async () => {
    const rows = await guestbook.actions.list.run({ contract: stub(2), flags: { limit: "10" } });
    assert.equal(rows.length, 2);
  });

  test("sign rejects a message over the byte limit before spending gas", async () => {
    const contract = {
      sign: async () => assert.fail("should not have been called"),
    };
    await assert.rejects(
      () => guestbook.actions.sign.run({ contract, args: ["a".repeat(281)] }),
      /281 bytes, over the 280 byte limit/
    );
  });

  test("sign measures bytes rather than characters", async () => {
    const contract = { sign: async () => assert.fail("should not have been called") };
    // 94 three-byte characters is 282 bytes but only 94 characters.
    await assert.rejects(
      () => guestbook.actions.sign.run({ contract, args: ["あ".repeat(94)] }),
      /282 bytes/
    );
  });

  test("sign accepts a message at exactly the limit", async () => {
    const contract = {
      sign: async () => ({
        hash: "0x1",
        wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }),
      }),
    };
    const result = await guestbook.actions.sign.run({ contract, args: ["a".repeat(280)] });
    assert.equal(result.status, "success");
  });
});
