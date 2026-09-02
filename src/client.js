const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const { resolveAddress, ConfigError } = require("./network");

const ABI_DIR = path.join(__dirname, "..", "abi");

const abiCache = new Map();

/**
 * Loads a contract ABI from the checked-in interfaces.
 *
 * @param {string} name Contract name, exactly as the file is called.
 * @returns {object[]}
 */
function loadAbi(name) {
  if (!abiCache.has(name)) {
    const file = path.join(ABI_DIR, `${name}.json`);
    if (!fs.existsSync(file)) throw new ConfigError(`No ABI for ${name} in abi/`);
    abiCache.set(name, JSON.parse(fs.readFileSync(file, "utf8")));
  }
  return abiCache.get(name);
}

/**
 * Opens a JSON-RPC connection to the resolved network.
 *
 * The chain id is pinned so ethers does not have to discover it, which saves
 * a round trip on every invocation of a short-lived CLI.
 */
function createProvider(network) {
  return new ethers.JsonRpcProvider(network.rpc, {
    chainId: Number(network.chainId),
    name: network.name,
  });
}

/**
 * Builds a signer for write commands.
 *
 * The key is read from the environment only. There is deliberately no --key
 * flag: a key passed on the command line ends up in shell history.
 */
function createSigner(network, provider, env = process.env) {
  const key = env.BASEBOOK_PRIVATE_KEY || env.PRIVATE_KEY;
  if (!key) {
    throw new ConfigError(
      "No key found. Set BASEBOOK_PRIVATE_KEY in the environment or in .env. " +
        "Read commands do not need one."
    );
  }
  return new ethers.Wallet(key.startsWith("0x") ? key : `0x${key}`, provider);
}

/**
 * Resolves a contract by name and returns it bound to a provider or signer.
 *
 * @param {object} network A resolved network.
 * @param {string} name Contract name, case-insensitive.
 * @param {object} runner A provider or signer.
 * @returns {{name: string, address: string, contract: import("ethers").Contract}}
 */
function createContract(network, name, runner) {
  const resolved = resolveAddress(network, name);
  const contract = new ethers.Contract(resolved.address, loadAbi(resolved.name), runner);
  return { ...resolved, contract };
}

const RATE_LIMIT_HINT =
  "The endpoint returned no data. The public Base RPC rate-limits bursts, so " +
  "this is usually throttling rather than the contract. Retry, or pass --rpc " +
  "with your own endpoint.";

/** Detects a throttling response, which arrives in several shapes. */
function looksRateLimited(err) {
  const code = err.info?.error?.code;
  if (code === -32016 || code === 429) return true;
  const text = `${err.info?.error?.message || ""} ${err.shortMessage || ""}`.toLowerCase();
  return text.includes("rate limit") || text.includes("too many requests");
}

/**
 * Turns a failed contract call into something a user can act on.
 *
 * ethers wraps a revert in a CALL_EXCEPTION whose message buries the reason
 * under stack noise, and reports a missing network as a generic error.
 *
 * A throttled request also surfaces as CALL_EXCEPTION, with no revert data
 * at all. Reporting that as a revert sends the reader looking at the contract
 * for a fault that is in the transport, so the two are separated here.
 */
function explainError(err) {
  if (looksRateLimited(err)) return RATE_LIMIT_HINT;

  if (err.code === "CALL_EXCEPTION") {
    if (err.reason) return `Reverted: ${err.reason}`;
    if (!err.data || err.data === "0x") return RATE_LIMIT_HINT;
    return "Reverted without a reason string";
  }

  if (err.code === "INSUFFICIENT_FUNDS") return "Not enough ETH to pay for this transaction";
  if (err.code === "NETWORK_ERROR" || err.code === "TIMEOUT" || err.code === "SERVER_ERROR") {
    return `Cannot reach the RPC endpoint: ${err.shortMessage || err.message}`;
  }
  if (err.code === "INVALID_ARGUMENT" && err.argument) {
    return `Invalid value for ${err.argument}: ${JSON.stringify(err.value)}`;
  }
  return err.shortMessage || err.message;
}

module.exports = { loadAbi, createProvider, createSigner, createContract, explainError, ABI_DIR };
