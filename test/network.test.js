const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { resolveNetwork, resolveAddress, ConfigError } = require("../src/network");

describe("resolveNetwork", () => {
  test("defaults to base", () => {
    assert.equal(resolveNetwork({}, {}).name, "base");
    assert.equal(resolveNetwork({}, {}).chainId, 8453n);
  });

  test("honours the network flag", () => {
    assert.equal(resolveNetwork({ network: "sepolia" }, {}).chainId, 84532n);
  });

  test("falls back to the environment when no flag is given", () => {
    assert.equal(resolveNetwork({}, { BASEBOOK_NETWORK: "sepolia" }).name, "sepolia");
  });

  test("lets the flag win over the environment", () => {
    const net = resolveNetwork({ network: "base" }, { BASEBOOK_NETWORK: "sepolia" });
    assert.equal(net.name, "base");
  });

  test("rejects an unknown network by name", () => {
    assert.throws(() => resolveNetwork({ network: "mainnet" }, {}), /Unknown network "mainnet"/);
  });

  test("lists the known networks in the error", () => {
    assert.throws(() => resolveNetwork({ network: "nope" }, {}), /base, sepolia/);
  });

  test("uses the public endpoint by default", () => {
    assert.equal(resolveNetwork({}, {}).rpc, "https://mainnet.base.org");
  });

  test("lets the rpc flag override the endpoint", () => {
    assert.equal(resolveNetwork({ rpc: "https://x" }, {}).rpc, "https://x");
  });

  test("lets the rpc flag win over the environment", () => {
    const net = resolveNetwork({ rpc: "https://flag" }, { BASEBOOK_RPC_URL: "https://env" });
    assert.equal(net.rpc, "https://flag");
  });

  test("reads the endpoint from the environment when there is no flag", () => {
    assert.equal(resolveNetwork({}, { BASEBOOK_RPC_URL: "https://env" }).rpc, "https://env");
  });
});

describe("resolveAddress", () => {
  const base = resolveNetwork({}, {});
  const sepolia = resolveNetwork({ network: "sepolia" }, {});

  test("resolves a contract by exact name", () => {
    const { name, address } = resolveAddress(base, "Counter");
    assert.equal(name, "Counter");
    assert.match(address, /^0x[0-9a-fA-F]{40}$/);
  });

  test("resolves case-insensitively", () => {
    assert.equal(resolveAddress(base, "counter").name, "Counter");
    assert.equal(resolveAddress(base, "COUNTER").name, "Counter");
  });

  test("returns the same address regardless of input casing", () => {
    assert.equal(resolveAddress(base, "counter").address, resolveAddress(base, "Counter").address);
  });

  test("knows all eleven contracts", () => {
    const names = [
      "Attestation",
      "BuilderBadge",
      "Counter",
      "Greeter",
      "Guestbook",
      "KeyValueStore",
      "NameRegistry",
      "Poll",
      "TodoList",
      "VersionLog",
      "Whitelist",
    ];
    for (const name of names) {
      assert.match(resolveAddress(base, name).address, /^0x[0-9a-fA-F]{40}$/, name);
    }
  });

  test("rejects an unknown contract", () => {
    assert.throws(() => resolveAddress(base, "Nope"), ConfigError);
  });

  test("says which contracts exist when one is not found", () => {
    assert.throws(() => resolveAddress(base, "Nope"), /Counter/);
  });

  test("reports a known contract that is not deployed on this network", () => {
    assert.throws(() => resolveAddress(sepolia, "Counter"), /not deployed on sepolia/);
  });
});
