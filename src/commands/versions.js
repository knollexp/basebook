const { required, submit } = require("./util");
const { timestamp } = require("../format");

class VersionError extends Error {}

/**
 * Parses a semver-like "major.minor.patch" string.
 *
 * Only the three numeric components are supported, because that is all the
 * contract stores. A pre-release suffix is rejected rather than dropped, so a
 * "1.0.0-rc1" does not silently publish as "1.0.0".
 */
function parseVersion(text) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(text);
  if (!match) {
    throw new VersionError(`<version> must be major.minor.patch, got: ${text}`);
  }
  const parts = match.slice(1).map(Number);
  for (const part of parts) {
    if (part > 0xffffffff) throw new VersionError(`<version> component out of range: ${part}`);
  }
  return parts;
}

module.exports = {
  contract: "VersionLog",
  summary: "An append-only release log with strictly increasing versions",
  actions: {
    latest: {
      describe: "Read the most recent release",
      usage: "versions latest",
      run: async ({ contract }) => {
        const release = await contract.latest();
        return {
          version: `${release.major}.${release.minor}.${release.patch}`,
          publishedAt: timestamp(release.timestamp),
          notes: release.notes,
        };
      },
    },
    total: {
      describe: "Count the published releases",
      usage: "versions total",
      run: async ({ contract }) => ({ total: await contract.total() }),
    },
    publish: {
      describe: "Publish a release newer than the current latest",
      usage: "versions publish <version> <notes>",
      write: true,
      run: async ({ contract, args }) => {
        const [major, minor, patch] = parseVersion(required(args, 0, "version"));
        return submit(contract.publish(major, minor, patch, required(args, 1, "notes")));
      },
    },
  },
  parseVersion,
  VersionError,
};
