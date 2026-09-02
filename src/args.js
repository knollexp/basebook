/**
 * Argument parsing for the CLI.
 *
 * Deliberately hand-rolled rather than pulled from a package: the grammar is
 * one command, one subcommand and a handful of long flags, and a dependency
 * that has to be audited is a poor trade for that.
 */

class UsageError extends Error {}

const FLAGS_WITH_VALUE = new Set(["network", "rpc", "from", "block", "limit"]);
const BOOLEAN_FLAGS = new Set(["json", "help", "version", "yes"]);

/**
 * Splits argv into a command path and flags.
 *
 * @param {string[]} argv Arguments after the node binary and script.
 * @returns {{path: string[], flags: object}}
 */
function parseArgs(argv) {
  const path = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--") {
      path.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith("--")) {
      const [name, inline] = splitFlag(arg.slice(2));

      if (BOOLEAN_FLAGS.has(name)) {
        if (inline !== undefined) throw new UsageError(`--${name} takes no value`);
        flags[name] = true;
        continue;
      }

      if (!FLAGS_WITH_VALUE.has(name)) throw new UsageError(`Unknown flag --${name}`);

      const value = inline !== undefined ? inline : argv[++i];
      if (value === undefined) throw new UsageError(`--${name} needs a value`);
      flags[name] = value;
      continue;
    }

    if (arg.startsWith("-") && arg.length > 1) {
      throw new UsageError(`Unknown flag ${arg}. Flags are long form only.`);
    }

    path.push(arg);
  }

  return { path, flags };
}

function splitFlag(rest) {
  const eq = rest.indexOf("=");
  return eq === -1 ? [rest, undefined] : [rest.slice(0, eq), rest.slice(eq + 1)];
}

/**
 * Reads a flag that must be a positive integer.
 *
 * @param {object} flags Parsed flags.
 * @param {string} name Flag name.
 * @param {number} fallback Value to use when the flag is absent.
 * @returns {number}
 */
function intFlag(flags, name, fallback) {
  if (flags[name] === undefined) return fallback;
  const value = Number(flags[name]);
  if (!Number.isInteger(value) || value <= 0) {
    throw new UsageError(`--${name} must be a positive integer, got "${flags[name]}"`);
  }
  return value;
}

module.exports = { parseArgs, intFlag, UsageError, FLAGS_WITH_VALUE, BOOLEAN_FLAGS };
