const { address, submit } = require("./util");
const { timestamp } = require("../format");

module.exports = {
  contract: "BuilderBadge",
  summary: "A one-per-address, non-transferable claim record",
  actions: {
    show: {
      describe: "Read the badge metadata and the claim total",
      usage: "badge show",
      run: async ({ contract }) => ({
        name: await contract.name(),
        symbol: await contract.symbol(),
        totalClaimed: await contract.totalClaimed(),
      }),
    },
    status: {
      describe: "Check whether an address has claimed",
      usage: "badge status <address>",
      run: async ({ contract, args }) => {
        const who = address(args, 0);
        const [claimed, at] = await Promise.all([contract.claimed(who), contract.claimedAt(who)]);
        return { address: who, claimed, claimedAt: timestamp(at) };
      },
    },
    claim: {
      describe: "Claim the badge for your address",
      usage: "badge claim",
      write: true,
      run: async ({ contract }) => submit(contract.claim()),
    },
  },
};
