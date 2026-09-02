const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const todo = require("../src/commands/todo");

const OWNER = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";

/** A list whose tasks are done according to the given flags. */
const stub = (flags) => ({
  taskCount: async () => BigInt(flags.length),
  taskAt: async (_owner, i) => ({ text: `task ${i}`, done: flags[Number(i)] }),
});

describe("todo", () => {
  test("targets the TodoList contract", () => {
    assert.equal(todo.contract, "TodoList");
  });

  test("list returns tasks in order with their ids", async () => {
    const rows = await todo.actions.list.run({ contract: stub([false, true]), args: [OWNER] });
    assert.equal(rows.length, 2);
    assert.equal(rows[0].id, 0n);
    assert.equal(rows[0].done, false);
    assert.equal(rows[1].done, true);
  });

  test("list returns nothing for an address with no tasks", async () => {
    assert.deepEqual(await todo.actions.list.run({ contract: stub([]), args: [OWNER] }), []);
  });

  test("count splits open and done", async () => {
    const result = await todo.actions.count.run({
      contract: stub([true, false, true, false, false]),
      args: [OWNER],
    });
    assert.equal(result.total, 5n);
    assert.equal(result.done, 2n);
    assert.equal(result.open, 3n);
  });

  test("count reports zeroes for an empty list", async () => {
    const result = await todo.actions.count.run({ contract: stub([]), args: [OWNER] });
    assert.equal(result.total, 0n);
    assert.equal(result.open, 0n);
  });

  test("count checksums the owner it reports", async () => {
    const result = await todo.actions.count.run({
      contract: stub([]),
      args: [OWNER.toLowerCase()],
    });
    assert.equal(result.owner, OWNER);
  });

  test("add requires text", async () => {
    await assert.rejects(() => todo.actions.add.run({ contract: {}, args: [] }), /Missing <text>/);
  });

  test("complete requires a numeric id", async () => {
    await assert.rejects(
      () => todo.actions.complete.run({ contract: {}, args: ["first"] }),
      /<id> must be a whole number/
    );
  });

  test("complete accepts id zero", async () => {
    let seen;
    const contract = {
      complete: async (id) => {
        seen = id;
        return { hash: "0x1", wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }) };
      },
    };
    await todo.actions.complete.run({ contract, args: ["0"] });
    assert.equal(seen, 0n);
  });
});
