const { BASE_MAINNET } = require("./addresses");

class ConfigError extends Error {}

/**
 * Known networks. Only Base mainnet carries an address book, because that is
 * the only chain the contracts were deployed to. Sepolia is listed so a
 * caller pointing at it gets a clear message rather than a silent read from
 * an empty address.
 */
const NETWORKS = {
  base: {
    chainId: 8453n,
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    addresses: BASE_MAINNET,
  },
  sepolia: {
    chainId: 84532n,
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    addresses: {},
  },
};

/**
 * Resolves the network to work against.
 *
 * @param {object} flags Parsed flags; --network and --rpc are read.
 * @param {object} env Environment, injected so tests need not mutate process.env.
 * @returns {{name: string, chainId: bigint, rpc: string, explorer: string, addresses: object}}
 */
function resolveNetwork(flags = {}, env = process.env) {
  const name = flags.network || env.BASEBOOK_NETWORK || "base";
  const network = NETWORKS[name];
  if (!network) {
    throw new ConfigError(
      `Unknown network "${name}". Known networks: ${Object.keys(NETWORKS).join(", ")}`
    );
  }

  // An explicit --rpc wins over the env var, which wins over the public
  // endpoint. The public one rate-limits, so overriding it is expected.
  const rpc = flags.rpc || env.BASEBOOK_RPC_URL || network.rpc;

  return { name, ...network, rpc };
}

/**
 * Looks up a deployed contract address on the resolved network.
 *
 * @param {object} network A resolved network.
 * @param {string} contract Contract name, case-insensitive.
 * @returns {{name: string, address: string}}
 */
function resolveAddress(network, contract) {
  const names = Object.keys(BASE_MAINNET);
  const match = names.find((n) => n.toLowerCase() === String(contract).toLowerCase());

  if (!match) {
    throw new ConfigError(`Unknown contract "${contract}". Known: ${names.join(", ")}`);
  }

  const address = network.addresses[match];
  if (!address) {
    throw new ConfigError(
      `${match} is not deployed on ${network.name}. Only base has an address book.`
    );
  }

  return { name: match, address };
}

module.exports = { NETWORKS, resolveNetwork, resolveAddress, ConfigError };
