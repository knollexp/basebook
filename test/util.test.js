const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const {
  required,
  address,
  bytes32,
  digest,
  index,
  boolean,
  decodeBytes32,
  submit,
  ArgumentError,
} = require("../src/commands/util");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";
const HASH = "0x" + "ab".repeat(32);

describe("required", () => {
  test("returns the value", () => {
    assert.equal(required(["x"], 0, "thing"), "x");
  });

  test("rejects a missing argument", () => {
    assert.throws(() => required([], 0, "thing"), /Missing <thing>/);
  });

  test("rejects an empty argument", () => {
    assert.throws(() => required([""], 0, "thing"), ArgumentError);
  });
});

describe("address", () => {
  test("checksums a lowercase address", () => {
    assert.equal(address([ADDR.toLowerCase()], 0), ADDR);
  });

  test("rejects a non-address", () => {
    assert.throws(() => address(["nope"], 0), /is not an address/);
  });

  test("rejects an address of the wrong length", () => {
    assert.throws(() => address(["0x1234"], 0), ArgumentError);
  });
});

describe("bytes32", () => {
  test("passes a full 32-byte hex value through", () => {
    assert.equal(bytes32([HASH], 0), HASH);
  });

  test("encodes a short label rather than hashing it", () => {
    const encoded = bytes32(["alice"], 0);
    assert.equal(encoded, ethers.encodeBytes32String("alice"));
    assert.equal(ethers.decodeBytes32String(encoded), "alice");
  });

  test("rejects hex of the wrong length instead of encoding it", () => {
    assert.throws(() => bytes32(["0xdead"], 0), /not 32 bytes/);
  });

  test("rejects a label that does not fit", () => {
    assert.throws(() => bytes32(["a".repeat(32)], 0), /longer than 31 bytes/);
  });

  test("accepts a label of exactly 31 bytes", () => {
    assert.doesNotThrow(() => bytes32(["a".repeat(31)], 0));
  });
});

describe("digest", () => {
  test("accepts a 32-byte hash", () => {
    assert.equal(digest([HASH], 0), HASH);
  });

  test("does not fall back to encoding a label", () => {
    assert.throws(() => digest(["alice"], 0), /must be a 32-byte hex hash/);
  });
});

describe("index", () => {
  test("parses a whole number as BigInt", () => {
    assert.equal(index(["3"], 0), 3n);
  });

  test("accepts zero", () => {
    assert.equal(index(["0"], 0), 0n);
  });

  test("rejects a negative number", () => {
    assert.throws(() => index(["-1"], 0), /whole number/);
  });

  test("rejects a fraction", () => {
    assert.throws(() => index(["1.5"], 0), ArgumentError);
  });
});

describe("boolean", () => {
  test("accepts several spellings of true", () => {
    for (const value of ["yes", "true", "y", "1", "YES"]) {
      assert.equal(boolean([value], 0), true, value);
    }
  });

  test("accepts several spellings of false", () => {
    for (const value of ["no", "false", "n", "0", "No"]) {
      assert.equal(boolean([value], 0), false, value);
    }
  });

  test("rejects anything else", () => {
    assert.throws(() => boolean(["maybe"], 0), /must be yes or no/);
  });
});

describe("decodeBytes32", () => {
  test("decodes an encoded label", () => {
    assert.equal(decodeBytes32(ethers.encodeBytes32String("alice")), "alice");
  });

  test("returns hex unchanged when it is not a string", () => {
    assert.equal(decodeBytes32(HASH), HASH);
  });

  test("returns the zero value rather than an empty string", () => {
    const zero = "0x" + "00".repeat(32);
    assert.equal(decodeBytes32(zero), zero);
  });
});

describe("submit", () => {
  const receipt = (status) => ({
    hash: "0xdead",
    wait: async () => ({ blockNumber: 12, gasUsed: 21000n, status }),
  });

  test("summarises a successful transaction", async () => {
    assert.deepEqual(await submit(Promise.resolve(receipt(1))), {
      hash: "0xdead",
      block: 12,
      gasUsed: 21000n,
      status: "success",
    });
  });

  test("reports a reverted transaction as failed", async () => {
    assert.equal((await submit(Promise.resolve(receipt(0)))).status, "failed");
  });
});
