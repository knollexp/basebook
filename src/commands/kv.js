const { address, bytes32, required, decodeBytes32, submit } = require("./util");

module.exports = {
  contract: "KeyValueStore",
  summary: "Per-address string storage under caller-chosen keys",
  actions: {
    get: {
      describe: "Read a value from an address's namespace",
      usage: "kv get <address> <key>",
      run: async ({ contract, args }) => {
        const owner = address(args, 0, "owner");
        const key = bytes32(args, 1, "key");
        const value = await contract.get(owner, key);
        return {
          owner,
          key: decodeBytes32(key),
          // An unset key and a key set to "" are indistinguishable on-chain,
          // so this reports the empty string rather than claiming it is unset.
          value,
          empty: value === "",
        };
      },
    },
    set: {
      describe: "Write a value into your own namespace",
      usage: "kv set <key> <value>",
      write: true,
      run: async ({ contract, args }) =>
        submit(contract.set(bytes32(args, 0, "key"), required(args, 1, "value"))),
    },
  },
};
