const { address, digest, submit } = require("./util");
const { timestamp } = require("../format");

module.exports = {
  contract: "Attestation",
  summary: "Timestamped attestations over a digest",
  actions: {
    check: {
      describe: "Look up whether an attester vouched for a digest",
      usage: "attest check <digest> <address>",
      run: async ({ contract, args }) => {
        const hash = digest(args, 0);
        const who = address(args, 1, "attester");
        const at = await contract.attestedAt(hash, who);
        return {
          digest: hash,
          attester: who,
          // A zero timestamp is the contract's way of saying "never", so it
          // must not be rendered as an epoch date.
          attested: at !== 0n,
          attestedAt: timestamp(at),
        };
      },
    },
    add: {
      describe: "Vouch for a digest under your address",
      usage: "attest add <digest>",
      write: true,
      run: async ({ contract, args }) => submit(contract.attest(digest(args, 0))),
    },
  },
};
