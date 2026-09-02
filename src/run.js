const fs = require("fs");
const path = require("path");
const { parseArgs, UsageError } = require("./args");
const { resolveNetwork, ConfigError } = require("./network");
const { resolveCommand, resolveAction } = require("./commands");
const { createProvider, createSigner, createContract, explainError } = require("./client");
const { ArgumentError } = require("./commands/util");
const { render } = require("./format");
const { help } = require("./help");

const ENV_FILE = path.join(__dirname, "..", ".env");
if (fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const VERSION = require("../package.json").version;

// Exit codes are distinct so a script can tell "you asked for something that
// does not exist" apart from "the chain said no".
const EXIT = { ok: 0, usage: 2, chain: 3 };

/**
 * Runs one invocation.
 *
 * Takes its io as parameters rather than touching process directly, so the
 * whole thing is testable without spawning a child process.
 *
 * @param {string[]} argv Arguments after the node binary and script.
 * @param {{out: Function, err: Function, env: object}} io
 * @returns {Promise<number>} The exit code.
 */
async function run(argv, io = {}) {
  const out = io.out || console.log;
  const err = io.err || console.error;
  const env = io.env || process.env;

  let provider = null;

  try {
    const { path: commandPath, flags } = parseArgs(argv);

    if (flags.version) {
      out(VERSION);
      return EXIT.ok;
    }

    if (flags.help || commandPath.length === 0 || commandPath[0] === "help") {
      out(help(commandPath[0] === "help" ? commandPath.slice(1) : commandPath.slice(0, 1)));
      return EXIT.ok;
    }

    const { key, command } = resolveCommand(commandPath[0]);
    const { action } = resolveAction(command, key, commandPath[1]);

    const network = resolveNetwork(flags, env);
    provider = createProvider(network);
    const runner = action.write ? createSigner(network, provider, env) : provider;
    const { contract } = createContract(network, command.contract, runner);

    const result = await action.run({ contract, args: commandPath.slice(2), flags, network });
    out(render(result, flags));
    return EXIT.ok;
  } catch (error) {
    if (
      error instanceof UsageError ||
      error instanceof ConfigError ||
      error instanceof ArgumentError
    ) {
      err(`${error.message}`);
      return EXIT.usage;
    }
    err(explainError(error));
    return EXIT.chain;
  } finally {
    // A JSON-RPC provider keeps a socket open, which would hold the process
    // alive after the command has already printed its result.
    if (provider) provider.destroy();
  }
}

module.exports = { run, EXIT, VERSION };
