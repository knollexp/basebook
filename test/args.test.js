const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { parseArgs, intFlag, UsageError } = require("../src/args");

describe("parseArgs", () => {
  test("returns an empty parse for no arguments", () => {
    assert.deepEqual(parseArgs([]), { path: [], flags: {} });
  });

  test("collects the command path in order", () => {
    assert.deepEqual(parseArgs(["counter", "read"]).path, ["counter", "read"]);
  });

  test("reads a flag value from the next argument", () => {
    assert.equal(parseArgs(["--network", "base"]).flags.network, "base");
  });

  test("reads a flag value written with an equals sign", () => {
    assert.equal(parseArgs(["--network=base"]).flags.network, "base");
  });

  test("keeps an equals sign inside the value", () => {
    assert.equal(parseArgs(["--rpc=https://x/?k=v"]).flags.rpc, "https://x/?k=v");
  });

  test("treats a known boolean flag as true", () => {
    assert.equal(parseArgs(["--json"]).flags.json, true);
  });

  test("rejects a value on a boolean flag", () => {
    assert.throws(() => parseArgs(["--json=yes"]), UsageError);
  });

  test("rejects an unknown flag", () => {
    assert.throws(() => parseArgs(["--wat"]), /Unknown flag --wat/);
  });

  test("rejects a value flag with nothing after it", () => {
    assert.throws(() => parseArgs(["--network"]), /needs a value/);
  });

  test("rejects short flags", () => {
    assert.throws(() => parseArgs(["-n"]), /long form only/);
  });

  test("does not mistake a negative number for a flag", () => {
    // A bare "-" is a path element, not a flag, so values starting with it
    // still need the -- separator; this pins the current behaviour.
    assert.throws(() => parseArgs(["-1"]), UsageError);
  });

  test("takes everything after -- as path elements", () => {
    const { path, flags } = parseArgs(["sign", "--", "--json", "-x"]);
    assert.deepEqual(path, ["sign", "--json", "-x"]);
    assert.deepEqual(flags, {});
  });

  test("mixes path elements and flags in any order", () => {
    const { path, flags } = parseArgs(["--json", "counter", "--network", "base", "read"]);
    assert.deepEqual(path, ["counter", "read"]);
    assert.deepEqual(flags, { json: true, network: "base" });
  });

  test("lets a later occurrence of a flag win", () => {
    assert.equal(parseArgs(["--network", "base", "--network", "sepolia"]).flags.network, "sepolia");
  });
});

describe("intFlag", () => {
  test("returns the fallback when the flag is absent", () => {
    assert.equal(intFlag({}, "limit", 10), 10);
  });

  test("parses a positive integer", () => {
    assert.equal(intFlag({ limit: "25" }, "limit", 10), 25);
  });

  test("rejects zero", () => {
    assert.throws(() => intFlag({ limit: "0" }, "limit", 10), /positive integer/);
  });

  test("rejects a negative value", () => {
    assert.throws(() => intFlag({ limit: "-5" }, "limit", 10), /positive integer/);
  });

  test("rejects a non-numeric value", () => {
    assert.throws(() => intFlag({ limit: "ten" }, "limit", 10), /positive integer/);
  });

  test("rejects a fractional value", () => {
    assert.throws(() => intFlag({ limit: "1.5" }, "limit", 10), /positive integer/);
  });
});
