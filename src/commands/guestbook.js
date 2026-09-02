const { required, index, submit } = require("./util");
const { timestamp, short } = require("../format");

const MAX_MESSAGE_BYTES = 280;

module.exports = {
  contract: "Guestbook",
  summary: "An append-only list of short signed messages",
  actions: {
    total: {
      describe: "Count the entries",
      usage: "guestbook total",
      run: async ({ contract }) => ({ total: await contract.total() }),
    },
    read: {
      describe: "Read one entry by index",
      usage: "guestbook read <index>",
      run: async ({ contract, args }) => {
        const entry = await contract.entryAt(index(args, 0));
        return {
          author: entry.author,
          signedAt: timestamp(entry.timestamp),
          message: entry.message,
        };
      },
    },
    list: {
      describe: "List the most recent entries",
      usage: "guestbook list [--limit n]",
      run: async ({ contract, flags }) => {
        const total = await contract.total();
        const limit = BigInt(flags.limit ? Number(flags.limit) : 10);
        // Walk backwards from the end so the newest entry is the first row,
        // and stop at zero rather than underflowing an unsigned index.
        const first = total > limit ? total - limit : 0n;

        const rows = [];
        for (let i = total - 1n; i >= first && i >= 0n; i--) {
          const entry = await contract.entryAt(i);
          rows.push({
            index: i,
            author: short(entry.author),
            signedAt: timestamp(entry.timestamp),
            message: entry.message,
          });
        }
        return rows;
      },
    },
    sign: {
      describe: "Append a message",
      usage: "guestbook sign <message>",
      write: true,
      run: async ({ contract, args }) => {
        const message = required(args, 0, "message");
        // The contract enforces this too, but failing here costs no gas and
        // says which limit was hit. The limit counts bytes, not characters.
        const size = Buffer.byteLength(message, "utf8");
        if (size > MAX_MESSAGE_BYTES) {
          throw new Error(`Message is ${size} bytes, over the ${MAX_MESSAGE_BYTES} byte limit`);
        }
        return submit(contract.sign(message));
      },
    },
  },
  MAX_MESSAGE_BYTES,
};
