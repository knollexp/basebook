const { required, submit } = require("./util");

module.exports = {
  contract: "Greeter",
  summary: "A greeting string anyone may replace",
  actions: {
    show: {
      describe: "Read the current greeting and the deployer",
      usage: "greeter show",
      run: async ({ contract }) => ({
        greeting: await contract.greeting(),
        deployer: await contract.deployer(),
      }),
    },
    set: {
      describe: "Replace the greeting",
      usage: "greeter set <text>",
      write: true,
      run: async ({ contract, args }) => submit(contract.setGreeting(required(args, 0, "text"))),
    },
  },
};
