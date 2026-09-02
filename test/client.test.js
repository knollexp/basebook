const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const {
  loadAbi,
  createProvider,
  createSigner,
  createContract,
  explainError,
} = require("../src/client");
const { resolveNetwork } = require("../src/network");
const { ConfigError } = require("../src/network");

const base = resolveNetwork({}, {});

// A throwaway key. It signs nothing here; the tests only check that a signer
// is constructed and that its address is derived deterministically.
const TEST_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const TEST_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("loadAbi", () => {
  test("loads a known ABI", () => {
    assert.ok(Array.isArray(loadAbi("Counter")));
  });

  test("returns entries with names and types", () => {
    const abi = loadAbi("Counter");
    assert.ok(abi.some((e) => e.type === "function" && e.name === "increment"));
    assert.ok(abi.some((e) => e.type === "event" && e.name === "Counted"));
  });

  test("caches so a second load is the same object", () => {
    assert.equal(loadAbi("Counter"), loadAbi("Counter"));
  });

  test("rejects an unknown ABI", () => {
    assert.throws(() => loadAbi("Nope"), ConfigError);
  });

  test("has an ABI for every contract in the address book", () => {
    for (const name of Object.keys(base.addresses)) {
      assert.ok(loadAbi(name).length > 0, name);
    }
  });
});

describe("createProvider", () => {
  test("pins the chain id rather than discovering it", async () => {
    const provider = createProvider(base);
    // Resolves from the static network config, so this does no network I/O.
    const network = await provider.getNetwork();
    assert.equal(network.chainId, 8453n);
    provider.destroy();
  });
});

describe("createSigner", () => {
  test("builds a wallet from the environment", () => {
    const signer = createSigner(base, null, { BASEBOOK_PRIVATE_KEY: TEST_KEY });
    assert.equal(signer.address, TEST_ADDRESS);
  });

  test("accepts a key without the 0x prefix", () => {
    const signer = createSigner(base, null, { BASEBOOK_PRIVATE_KEY: TEST_KEY.slice(2) });
    assert.equal(signer.address, TEST_ADDRESS);
  });

  test("falls back to PRIVATE_KEY", () => {
    assert.equal(createSigner(base, null, { PRIVATE_KEY: TEST_KEY }).address, TEST_ADDRESS);
  });

  test("prefers the namespaced variable", () => {
    const signer = createSigner(base, null, {
      BASEBOOK_PRIVATE_KEY: TEST_KEY,
      PRIVATE_KEY: "0x" + "11".repeat(32),
    });
    assert.equal(signer.address, TEST_ADDRESS);
  });

  test("explains itself when no key is set", () => {
    assert.throws(() => createSigner(base, null, {}), /Read commands do not need one/);
  });
});

describe("createContract", () => {
  test("binds a contract at its deployed address", () => {
    const { name, address, contract } = createContract(base, "counter", null);
    assert.equal(name, "Counter");
    assert.equal(contract.target, address);
  });

  test("exposes the contract functions", () => {
    const { contract } = createContract(base, "Counter", null);
    assert.equal(typeof contract.increment, "function");
    assert.equal(typeof contract.count, "function");
  });

  test("rejects an unknown contract", () => {
    assert.throws(() => createContract(base, "Nope", null), ConfigError);
  });
});

describe("explainError", () => {
  test("surfaces a revert reason", () => {
    const message = explainError({ code: "CALL_EXCEPTION", reason: "Counter: underflow" });
    assert.equal(message, "Reverted: Counter: underflow");
  });

  test("reports a revert that carries data but no reason string", () => {
    assert.match(explainError({ code: "CALL_EXCEPTION", data: "0x1234" }), /without a reason/);
  });

  test("does not call a dataless failure a revert", () => {
    // A throttled request arrives as CALL_EXCEPTION with no revert data.
    // Calling that a revert points the reader at the contract instead of the
    // transport, which is what happened while testing against the public
    // endpoint.
    const message = explainError({ code: "CALL_EXCEPTION", data: "0x" });
    assert.doesNotMatch(message, /Reverted/);
    assert.match(message, /rate-limits/);
  });

  test("treats a missing data field the same way", () => {
    assert.match(explainError({ code: "CALL_EXCEPTION" }), /rate-limits/);
  });

  test("recognises an explicit rate limit code", () => {
    assert.match(explainError({ info: { error: { code: -32016 } } }), /rate-limits/);
  });

  test("recognises a rate limit named in the message", () => {
    const err = { info: { error: { message: "Your app has exceeded its rate limit" } } };
    assert.match(explainError(err), /rate-limits/);
  });

  test("reports a server error as an endpoint problem", () => {
    assert.match(explainError({ code: "SERVER_ERROR", shortMessage: "502" }), /Cannot reach/);
  });

  test("translates insufficient funds", () => {
    assert.match(explainError({ code: "INSUFFICIENT_FUNDS" }), /Not enough ETH/);
  });

  test("names the offending argument", () => {
    const message = explainError({ code: "INVALID_ARGUMENT", argument: "digest", value: "x" });
    assert.equal(message, 'Invalid value for digest: "x"');
  });

  test("falls back to the short message", () => {
    assert.equal(explainError({ shortMessage: "boom", message: "boom with a stack" }), "boom");
  });

  test("falls back to the message when there is no short one", () => {
    assert.equal(explainError({ message: "plain" }), "plain");
  });
});
