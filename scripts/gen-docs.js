const fs = require("fs");
const path = require("path");
const { COMMANDS } = require("../src/commands");

/**
 * Regenerates docs/commands.md from the registry, so the table cannot drift
 * away from the code the way a hand-written one does.
 */
function render() {
  const lines = [
    "# Commands",
    "",
    "Generated from the command registry by `npm run docs`. Actions marked",
    "(write) send a transaction and need a key; everything else only reads.",
    "",
  ];

  for (const [key, command] of Object.entries(COMMANDS)) {
    lines.push(`## ${key}`, "");
    lines.push(`${command.summary}. Contract: \`${command.contract}\`.`, "");
    lines.push("| Action | What it does |", "| --- | --- |");
    for (const action of Object.values(command.actions)) {
      const write = action.write ? " (write)" : "";
      lines.push(`| \`${action.usage}\` | ${action.describe}${write} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

if (require.main === module) {
  const out = path.join(__dirname, "..", "docs", "commands.md");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render());
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

module.exports = { render };
