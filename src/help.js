const { COMMANDS, resolveCommand } = require("./commands");
const { NETWORKS } = require("./network");

const USAGE = `basebook - a CLI for the eleven base-contracts on Base

Usage:
  basebook <command> <action> [arguments] [flags]
  basebook help [command]

Flags:
  --network <name>   Network to use (default: base)
  --rpc <url>        RPC endpoint, overriding the public one
  --json             Emit JSON instead of a table
  --limit <n>        Row limit for listing actions
  --help             Show this help
  --version          Show the version

Environment:
  BASEBOOK_PRIVATE_KEY   Key for write actions. Read actions need none.
  BASEBOOK_RPC_URL       Default RPC endpoint
  BASEBOOK_NETWORK       Default network`;

/** Renders the top-level help, listing one line per command. */
function overview() {
  const width = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  const lines = Object.entries(COMMANDS).map(
    ([key, command]) => `  ${key.padEnd(width)}  ${command.summary}`
  );

  return [
    USAGE,
    "",
    "Commands:",
    ...lines,
    "",
    `Networks: ${Object.keys(NETWORKS).join(", ")}`,
    "",
    'Run "basebook help <command>" for its actions.',
  ].join("\n");
}

/** Renders the help for one command, listing its actions. */
function commandHelp(name) {
  const { key, command } = resolveCommand(name);
  const actions = Object.entries(command.actions);
  const width = Math.max(...actions.map(([, a]) => a.usage.length));

  const lines = actions.map(([, action]) => {
    const marker = action.write ? "  (write)" : "";
    return `  ${action.usage.padEnd(width)}  ${action.describe}${marker}`;
  });

  return [
    `${key} - ${command.summary}`,
    `Contract: ${command.contract}`,
    "",
    "Actions:",
    ...lines,
    "",
    "Actions marked (write) send a transaction and need BASEBOOK_PRIVATE_KEY.",
  ].join("\n");
}

/** Picks between the overview and per-command help. */
function help(path = []) {
  return path.length > 0 ? commandHelp(path[0]) : overview();
}

module.exports = { help, overview, commandHelp, USAGE };
