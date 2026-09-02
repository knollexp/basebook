const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { COMMANDS, resolveCommand, resolveAction } = require("../src/commands");
const { help, overview, commandHelp } = require("../src/help");
const { loadAbi } = require("../src/client");
const { ConfigError } = require("../src/network");

describe("command registry", () => {
  test("covers all eleven contracts exactly once", () => {
    const contracts = Object.values(COMMANDS).map((c) => c.contract);
    assert.equal(contracts.length, 11);
    assert.equal(new Set(contracts).size, 11);
  });

  test("every command names a contract that has an ABI", () => {
    for (const [key, command] of Object.entries(COMMANDS)) {
      assert.ok(loadAbi(command.contract).length > 0, key);
    }
  });

  test("every action declares a usage line and a description", () => {
    for (const [key, command] of Object.entries(COMMANDS)) {
      for (const [name, action] of Object.entries(command.actions)) {
        assert.ok(action.usage, `${key} ${name} usage`);
        assert.ok(action.describe, `${key} ${name} describe`);
        assert.equal(typeof action.run, "function", `${key} ${name} run`);
      }
    }
  });

  test("every usage line starts with its own command name", () => {
    for (const [key, command] of Object.entries(COMMANDS)) {
      for (const action of Object.values(command.actions)) {
        assert.ok(action.usage.startsWith(key), `${action.usage} should start with ${key}`);
      }
    }
  });

  test("every command has a summary", () => {
    for (const [key, command] of Object.entries(COMMANDS)) {
      assert.ok(command.summary, key);
    }
  });

  test("resolves a command case-insensitively", () => {
    assert.equal(resolveCommand("COUNTER").key, "counter");
  });

  test("rejects an unknown command and points at help", () => {
    assert.throws(() => resolveCommand("nope"), /Run "basebook help"/);
  });

  test("rejects an empty command name", () => {
    assert.throws(() => resolveCommand(undefined), ConfigError);
  });

  test("resolves an action case-insensitively", () => {
    const { command } = resolveCommand("counter");
    assert.equal(resolveAction(command, "counter", "SHOW").name, "show");
  });

  test("lists the available actions when none is given", () => {
    const { command } = resolveCommand("counter");
    assert.throws(() => resolveAction(command, "counter", undefined), /show, increment, decrement/);
  });

  test("lists the available actions when one is wrong", () => {
    const { command } = resolveCommand("counter");
    assert.throws(() => resolveAction(command, "counter", "bump"), /has no action "bump"/);
  });
});

describe("help", () => {
  test("the overview lists every command", () => {
    const text = overview();
    for (const key of Object.keys(COMMANDS)) {
      assert.match(text, new RegExp(`\\b${key}\\b`), key);
    }
  });

  test("the overview names both networks", () => {
    assert.match(overview(), /base, sepolia/);
  });

  test("command help lists every action of that command", () => {
    const text = commandHelp("poll");
    assert.match(text, /poll show/);
    assert.match(text, /poll voted/);
    assert.match(text, /poll vote /);
  });

  test("command help marks write actions and leaves reads unmarked", () => {
    const lines = commandHelp("counter").split("\n");
    const show = lines.find((l) => l.includes("counter show"));
    const increment = lines.find((l) => l.includes("counter increment"));
    assert.doesNotMatch(show, /\(write\)/);
    assert.match(increment, /\(write\)/);
  });

  test("command help names the contract behind the command", () => {
    assert.match(commandHelp("kv"), /Contract: KeyValueStore/);
  });

  test("help falls back to the overview with no argument", () => {
    assert.equal(help([]), overview());
  });

  test("help dispatches to a command when given one", () => {
    assert.equal(help(["counter"]), commandHelp("counter"));
  });

  test("help rejects an unknown command", () => {
    assert.throws(() => help(["nope"]), ConfigError);
  });
});
