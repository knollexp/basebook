const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const versions = require("../src/commands/versions");
const { parseVersion, VersionError } = versions;

describe("parseVersion", () => {
  test("splits a three-part version", () => {
    assert.deepEqual(parseVersion("1.2.3"), [1, 2, 3]);
  });

  test("accepts zeroes", () => {
    assert.deepEqual(parseVersion("0.0.0"), [0, 0, 0]);
  });

  test("accepts multi-digit components", () => {
    assert.deepEqual(parseVersion("10.20.30"), [10, 20, 30]);
  });

  test("rejects a two-part version", () => {
    assert.throws(() => parseVersion("1.2"), VersionError);
  });

  test("rejects a pre-release suffix rather than dropping it", () => {
    assert.throws(() => parseVersion("1.0.0-rc1"), /must be major.minor.patch/);
  });

  test("rejects a leading v", () => {
    assert.throws(() => parseVersion("v1.0.0"), VersionError);
  });

  test("rejects a component that overflows uint32", () => {
    assert.throws(() => parseVersion("4294967296.0.0"), /out of range/);
  });

  test("accepts the largest in-range component", () => {
    assert.deepEqual(parseVersion("4294967295.0.0"), [4294967295, 0, 0]);
  });
});

describe("versions", () => {
  test("targets the VersionLog contract", () => {
    assert.equal(versions.contract, "VersionLog");
  });

  test("latest formats the version and time", async () => {
    const contract = {
      latest: async () => ({
        major: 1n,
        minor: 2n,
        patch: 3n,
        timestamp: 1700000000n,
        notes: "first",
      }),
    };
    const result = await versions.actions.latest.run({ contract });
    assert.equal(result.version, "1.2.3");
    assert.equal(result.publishedAt, "2023-11-14T22:13:20Z");
    assert.equal(result.notes, "first");
  });

  test("total counts releases", async () => {
    assert.deepEqual(await versions.actions.total.run({ contract: { total: async () => 4n } }), {
      total: 4n,
    });
  });

  test("publish splits the version into components", async () => {
    let seen;
    const contract = {
      publish: async (...args) => {
        seen = args;
        return { hash: "0x1", wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }) };
      },
    };
    await versions.actions.publish.run({ contract, args: ["2.0.1", "notes here"] });
    assert.deepEqual(seen, [2, 0, 1, "notes here"]);
  });

  test("publish requires notes", async () => {
    await assert.rejects(
      () => versions.actions.publish.run({ contract: {}, args: ["1.0.0"] }),
      /Missing <notes>/
    );
  });
});
