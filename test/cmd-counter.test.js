const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const counter = require("../src/commands/counter");

const tx = (hash) => ({
  hash,
  wait: async () => ({ blockNumber: 100, gasUsed: 23734n, status: 1 }),
});

describe("counter", () => {
  test("targets the Counter contract", () => {
    assert.equal(counter.contract, "Counter");
  });

  test("marks the writing actions and only those", () => {
    assert.equal(counter.actions.show.write, undefined);
    assert.equal(counter.actions.increment.write, true);
    assert.equal(counter.actions.decrement.write, true);
  });

  test("show reads the count", async () => {
    const contract = { count: async () => 7n };
    assert.deepEqual(await counter.actions.show.run({ contract }), { count: 7n });
  });

  test("show reports a zero count rather than nothing", async () => {
    const contract = { count: async () => 0n };
    assert.deepEqual(await counter.actions.show.run({ contract }), { count: 0n });
  });

  test("increment submits and summarises the receipt", async () => {
    const contract = { increment: async () => tx("0xaaa") };
    const result = await counter.actions.increment.run({ contract });
    assert.equal(result.hash, "0xaaa");
    assert.equal(result.status, "success");
    assert.equal(result.gasUsed, 23734n);
  });

  test("decrement submits", async () => {
    const contract = { decrement: async () => tx("0xbbb") };
    assert.equal((await counter.actions.decrement.run({ contract })).hash, "0xbbb");
  });

  test("decrement propagates a revert", async () => {
    const contract = {
      decrement: async () => {
        throw Object.assign(new Error("x"), {
          code: "CALL_EXCEPTION",
          reason: "Counter: underflow",
        });
      },
    };
    await assert.rejects(() => counter.actions.decrement.run({ contract }), /x/);
  });
});
