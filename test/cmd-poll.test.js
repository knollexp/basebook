const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const poll = require("../src/commands/poll");

const ADDR = "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955";
const tx = () => ({
  hash: "0xvote",
  wait: async () => ({ blockNumber: 1, gasUsed: 1n, status: 1 }),
});

const stub = (yes, no) => ({
  question: async () => "Are you building on Base?",
  yesVotes: async () => yes,
  noVotes: async () => no,
});

describe("poll", () => {
  test("targets the Poll contract", () => {
    assert.equal(poll.contract, "Poll");
  });

  test("show totals the votes", async () => {
    const result = await poll.actions.show.run({ contract: stub(3n, 1n) });
    assert.equal(result.total, 4n);
    assert.equal(result.yesPercent, "75%");
  });

  test("show avoids dividing by zero on an empty poll", async () => {
    const result = await poll.actions.show.run({ contract: stub(0n, 0n) });
    assert.equal(result.total, 0n);
    assert.equal(result.yesPercent, "-");
  });

  test("show reports a unanimous poll as 100%", async () => {
    assert.equal((await poll.actions.show.run({ contract: stub(5n, 0n) })).yesPercent, "100%");
  });

  test("show truncates rather than rounding the percentage", async () => {
    // 2 of 3 is 66.67%, reported as 66.
    assert.equal((await poll.actions.show.run({ contract: stub(2n, 1n) })).yesPercent, "66%");
  });

  test("voted checksums the address it reports", async () => {
    const contract = { hasVoted: async () => true };
    const result = await poll.actions.voted.run({ contract, args: [ADDR.toLowerCase()] });
    assert.equal(result.address, ADDR);
    assert.equal(result.voted, true);
  });

  test("voted rejects a non-address", async () => {
    await assert.rejects(
      () => poll.actions.voted.run({ contract: {}, args: ["nope"] }),
      /is not an address/
    );
  });

  test("vote translates yes and no", async () => {
    const seen = [];
    const contract = {
      vote: async (support) => {
        seen.push(support);
        return tx();
      },
    };
    await poll.actions.vote.run({ contract, args: ["yes"] });
    await poll.actions.vote.run({ contract, args: ["no"] });
    assert.deepEqual(seen, [true, false]);
  });

  test("vote rejects an unclear answer", async () => {
    await assert.rejects(
      () => poll.actions.vote.run({ contract: {}, args: ["maybe"] }),
      /must be yes or no/
    );
  });
});
