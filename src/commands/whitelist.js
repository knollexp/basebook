const { address, submit } = require("./util");

module.exports = {
  contract: "Whitelist",
  summary: "An owner-managed allowlist",
  actions: {
    owner: {
      describe: "Read the current owner",
      usage: "whitelist owner",
      run: async ({ contract }) => ({ owner: await contract.owner() }),
    },
    check: {
      describe: "Check whether an address is allowed",
      usage: "whitelist check <address>",
      run: async ({ contract, args }) => {
        const who = address(args, 0);
        return { address: who, allowed: await contract.allowed(who) };
      },
    },
    allow: {
      describe: "Add an address (owner only)",
      usage: "whitelist allow <address>",
      write: true,
      run: async ({ contract, args }) => submit(contract.allow(address(args, 0))),
    },
    revoke: {
      describe: "Remove an address (owner only)",
      usage: "whitelist revoke <address>",
      write: true,
      run: async ({ contract, args }) => submit(contract.revoke(address(args, 0))),
    },
  },
};
