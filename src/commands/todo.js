const { address, required, index, submit } = require("./util");

module.exports = {
  contract: "TodoList",
  summary: "A per-address task list with one-way completion",
  actions: {
    list: {
      describe: "List an address's tasks",
      usage: "todo list <address>",
      run: async ({ contract, args }) => {
        const owner = address(args, 0, "owner");
        const count = await contract.taskCount(owner);

        const rows = [];
        for (let i = 0n; i < count; i++) {
          const task = await contract.taskAt(owner, i);
          rows.push({ id: i, done: task.done, text: task.text });
        }
        return rows;
      },
    },
    count: {
      describe: "Count an address's tasks, open and done",
      usage: "todo count <address>",
      run: async ({ contract, args }) => {
        const owner = address(args, 0, "owner");
        const total = await contract.taskCount(owner);

        let done = 0n;
        for (let i = 0n; i < total; i++) {
          if ((await contract.taskAt(owner, i)).done) done++;
        }
        return { owner, total, done, open: total - done };
      },
    },
    add: {
      describe: "Append a task to your own list",
      usage: "todo add <text>",
      write: true,
      run: async ({ contract, args }) => submit(contract.addTask(required(args, 0, "text"))),
    },
    complete: {
      describe: "Mark one of your tasks done",
      usage: "todo complete <id>",
      write: true,
      run: async ({ contract, args }) => submit(contract.complete(index(args, 0, "id"))),
    },
  },
};
