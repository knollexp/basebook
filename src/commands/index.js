const { ConfigError } = require("../network");

/**
 * The command registry.
 *
 * Listed explicitly rather than discovered by reading the directory: an
 * explicit list fails at require time if a module is missing, and keeps the
 * order of `basebook help` stable and intentional rather than alphabetical by
 * filename.
 */
const COMMANDS = {
  counter: require("./counter"),
  greeter: require("./greeter"),
  guestbook: require("./guestbook"),
  poll: require("./poll"),
  registry: require("./registry"),
  todo: require("./todo"),
  kv: require("./kv"),
  badge: require("./badge"),
  attest: require("./attest"),
  versions: require("./versions"),
  whitelist: require("./whitelist"),
};

/**
 * Looks up a command by name.
 *
 * @param {string} name
 * @returns {{key: string, command: object}}
 */
function resolveCommand(name) {
  const key = String(name || "").toLowerCase();
  const command = COMMANDS[key];
  if (!command) {
    throw new ConfigError(`Unknown command "${name}". Run "basebook help" for the list.`);
  }
  return { key, command };
}

/**
 * Looks up an action within a command.
 *
 * @param {object} command A command from the registry.
 * @param {string} key The command's own name, for error messages.
 * @param {string} name The action name.
 * @returns {{name: string, action: object}}
 */
function resolveAction(command, key, name) {
  if (name === undefined) {
    throw new ConfigError(
      `"${key}" needs an action. Available: ${Object.keys(command.actions).join(", ")}`
    );
  }
  const action = command.actions[String(name).toLowerCase()];
  if (!action) {
    throw new ConfigError(
      `"${key}" has no action "${name}". Available: ${Object.keys(command.actions).join(", ")}`
    );
  }
  return { name: String(name).toLowerCase(), action };
}

module.exports = { COMMANDS, resolveCommand, resolveAction };
