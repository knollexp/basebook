const { address, boolean, submit } = require("./util");

module.exports = {
  contract: "Poll",
  summary: "A one-vote-per-address yes/no poll",
  actions: {
    show: {
      describe: "Read the question and the tally",
      usage: "poll show",
      run: async ({ contract }) => {
        const [question, yes, no] = await Promise.all([
          contract.question(),
          contract.yesVotes(),
          contract.noVotes(),
        ]);
        const total = yes + no;
        return {
          question,
          yes,
          no,
          total,
          // Reported as a whole percent; the poll is a tally, not a survey
          // instrument, and a decimal place would imply precision it lacks.
          yesPercent: total === 0n ? "-" : `${(yes * 100n) / total}%`,
        };
      },
    },
    voted: {
      describe: "Check whether an address has voted",
      usage: "poll voted <address>",
      run: async ({ contract, args }) => {
        const who = address(args, 0);
        return { address: who, voted: await contract.hasVoted(who) };
      },
    },
    vote: {
      describe: "Cast your vote",
      usage: "poll vote <yes|no>",
      write: true,
      run: async ({ contract, args }) => submit(contract.vote(boolean(args, 0, "vote"))),
    },
  },
};
