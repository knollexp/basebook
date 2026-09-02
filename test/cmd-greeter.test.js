const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const greeter = require("../src/commands/greeter");

const tx = () => ({
  hash: "0xfeed",
  wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }),
});

describe("greeter", () => {
  test("targets the Greeter contract", () => {
    assert.equal(greeter.contract, "Greeter");
  });

  test("show reads the greeting and the deployer", async () => {
    const contract = {
      greeting: async () => "gm base",
      deployer: async () => "0xabc",
    };
    assert.deepEqual(await greeter.actions.show.run({ contract }), {
      greeting: "gm base",
      deployer: "0xabc",
    });
  });

  test("show reports an empty greeting as itself", async () => {
    const contract = { greeting: async () => "", deployer: async () => "0xabc" };
    assert.equal((await greeter.actions.show.run({ contract })).greeting, "");
  });

  test("set passes the text through", async () => {
    let seen;
    const contract = {
      setGreeting: async (text) => {
        seen = text;
        return tx();
      },
    };
    await greeter.actions.set.run({ contract, args: ["wagmi"] });
    assert.equal(seen, "wagmi");
  });

  test("set requires text", async () => {
    await assert.rejects(
      () => greeter.actions.set.run({ contract: {}, args: [] }),
      /Missing <text>/
    );
  });

  test("set keeps whitespace in the text", async () => {
    let seen;
    const contract = {
      setGreeting: async (text) => {
        seen = text;
        return tx();
      },
    };
    await greeter.actions.set.run({ contract, args: ["  hello  "] });
    assert.equal(seen, "  hello  ");
  });
});
