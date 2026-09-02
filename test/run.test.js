const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { run, EXIT, VERSION } = require("../src/run");

/** Captures what a run wrote, so nothing reaches the real console. */
function capture(env = {}) {
  const out = [];
  const err = [];
  return {
    io: { out: (line) => out.push(String(line)), err: (line) => err.push(String(line)), env },
    out,
    err,
  };
}

describe("run", () => {
  test("prints the overview with no arguments", async () => {
    const { io, out } = capture();
    assert.equal(await run([], io), EXIT.ok);
    assert.match(out.join("\n"), /Usage:/);
  });

  test("prints the overview for --help", async () => {
    const { io, out } = capture();
    assert.equal(await run(["--help"], io), EXIT.ok);
    assert.match(out.join("\n"), /Commands:/);
  });

  test("prints command help for the help subcommand", async () => {
    const { io, out } = capture();
    assert.equal(await run(["help", "counter"], io), EXIT.ok);
    assert.match(out.join("\n"), /Contract: Counter/);
  });

  test("prints the version", async () => {
    const { io, out } = capture();
    assert.equal(await run(["--version"], io), EXIT.ok);
    assert.deepEqual(out, [VERSION]);
  });

  test("reports an unknown command as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["nope", "show"], io), EXIT.usage);
    assert.match(err.join("\n"), /Unknown command/);
  });

  test("reports an unknown action as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter", "bump"], io), EXIT.usage);
    assert.match(err.join("\n"), /has no action/);
  });

  test("reports a missing action as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter"], io), EXIT.usage);
    assert.match(err.join("\n"), /needs an action/);
  });

  test("reports an unknown flag as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter", "show", "--wat"], io), EXIT.usage);
    assert.match(err.join("\n"), /Unknown flag/);
  });

  test("reports an unknown network as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter", "show", "--network", "mainnet"], io), EXIT.usage);
    assert.match(err.join("\n"), /Unknown network/);
  });

  test("reports a contract missing from a network as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter", "show", "--network", "sepolia"], io), EXIT.usage);
    assert.match(err.join("\n"), /not deployed on sepolia/);
  });

  test("reports a bad argument as a usage error before touching the network", async () => {
    const { io, err } = capture();
    assert.equal(await run(["poll", "voted", "not-an-address"], io), EXIT.usage);
    assert.match(err.join("\n"), /is not an address/);
  });

  test("refuses a write action with no key, as a usage error", async () => {
    const { io, err } = capture();
    assert.equal(await run(["counter", "increment"], io), EXIT.usage);
    assert.match(err.join("\n"), /No key found/);
  });

  test("separates usage and chain exit codes", () => {
    assert.notEqual(EXIT.usage, EXIT.chain);
    assert.equal(EXIT.ok, 0);
  });
});
