const { ethers } = require("ethers");

class ArgumentError extends Error {}

/**
 * Reads a positional argument that must be present.
 *
 * @param {string[]} args Positional arguments for the action.
 * @param {number} index Position to read.
 * @param {string} label What the argument is, used in the error message.
 * @returns {string}
 */
function required(args, index, label) {
  const value = args[index];
  if (value === undefined || value === "") throw new ArgumentError(`Missing <${label}>`);
  return value;
}

/**
 * Reads an argument that must be a 20-byte address.
 *
 * @returns {string} The checksummed address.
 */
function address(args, index, label = "address") {
  const value = required(args, index, label);
  if (!ethers.isAddress(value)) throw new ArgumentError(`<${label}> is not an address: ${value}`);
  return ethers.getAddress(value);
}

/**
 * Reads an argument as bytes32.
 *
 * Accepts either a full 32-byte hex string or a short label, which is encoded
 * rather than hashed: the on-chain value stays readable in an explorer, which
 * is the point of using bytes32 for names in the first place.
 */
function bytes32(args, index, label = "key") {
  const value = required(args, index, label);
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return value;
  if (value.startsWith("0x")) {
    throw new ArgumentError(`<${label}> looks like hex but is not 32 bytes: ${value}`);
  }
  try {
    return ethers.encodeBytes32String(value);
  } catch {
    throw new ArgumentError(`<${label}> is longer than 31 bytes: ${value}`);
  }
}

/**
 * Reads an argument that must be a 32-byte hash, with no encoding fallback.
 */
function digest(args, index, label = "digest") {
  const value = required(args, index, label);
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new ArgumentError(`<${label}> must be a 32-byte hex hash, got: ${value}`);
  }
  return value;
}

/** Reads an argument that must be a non-negative integer index. */
function index(args, position, label = "index") {
  const value = required(args, position, label);
  if (!/^\d+$/.test(value)) throw new ArgumentError(`<${label}> must be a whole number: ${value}`);
  return BigInt(value);
}

/** Reads an argument that must be true or false. */
function boolean(args, position, label = "value") {
  const value = required(args, position, label).toLowerCase();
  if (["yes", "true", "y", "1"].includes(value)) return true;
  if (["no", "false", "n", "0"].includes(value)) return false;
  throw new ArgumentError(`<${label}> must be yes or no, got: ${value}`);
}

/** Decodes a bytes32 back to text, falling back to hex when it is not a string. */
function decodeBytes32(value) {
  try {
    const text = ethers.decodeBytes32String(value);
    return text === "" ? value : text;
  } catch {
    return value;
  }
}

/**
 * Sends a transaction and waits for it, returning a uniform receipt summary.
 *
 * Every write command reports the same shape, so the output does not change
 * depending on which contract was touched.
 */
async function submit(txPromise) {
  const tx = await txPromise;
  const receipt = await tx.wait();
  return {
    hash: tx.hash,
    block: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    status: receipt.status === 1 ? "success" : "failed",
  };
}

module.exports = {
  required,
  address,
  bytes32,
  digest,
  index,
  boolean,
  decodeBytes32,
  submit,
  ArgumentError,
};
