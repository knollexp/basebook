const { address, bytes32, decodeBytes32, submit } = require("./util");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  contract: "NameRegistry",
  summary: "First-come, first-served names bound to an address",
  actions: {
    lookup: {
      describe: "Find who holds a name",
      usage: "registry lookup <name>",
      run: async ({ contract, args }) => {
        const key = bytes32(args, 0, "name");
        const holder = await contract.ownerOf(key);
        return {
          name: decodeBytes32(key),
          // The registry returns the zero address for a free name, which is
          // worth stating rather than printing as an address.
          owner: holder === ZERO_ADDRESS ? null : holder,
          available: holder === ZERO_ADDRESS,
        };
      },
    },
    of: {
      describe: "Find the name an address holds",
      usage: "registry of <address>",
      run: async ({ contract, args }) => {
        const who = address(args, 0);
        const name = await contract.nameOf(who);
        return {
          address: who,
          name: name === ZERO_BYTES32 ? null : decodeBytes32(name),
        };
      },
    },
    register: {
      describe: "Claim a free name",
      usage: "registry register <name>",
      write: true,
      run: async ({ contract, args }) => submit(contract.register(bytes32(args, 0, "name"))),
    },
    release: {
      describe: "Give up the name you hold",
      usage: "registry release",
      write: true,
      run: async ({ contract }) => submit(contract.release()),
    },
  },
};
