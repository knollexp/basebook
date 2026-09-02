const { submit } = require("./util");

module.exports = {
  contract: "Counter",
  summary: "A single shared counter anyone may move",
  actions: {
    show: {
      describe: "Read the current value",
      usage: "counter show",
      run: async ({ contract }) => ({ count: await contract.count() }),
    },
    increment: {
      describe: "Increase the counter by one",
      usage: "counter increment",
      write: true,
      run: async ({ contract }) => submit(contract.increment()),
    },
    decrement: {
      describe: "Decrease the counter by one",
      usage: "counter decrement",
      write: true,
      run: async ({ contract }) => submit(contract.decrement()),
    },
  },
};
