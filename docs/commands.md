# Commands

Generated from the command registry by `npm run docs`. Actions marked
(write) send a transaction and need a key; everything else only reads.

## counter

A single shared counter anyone may move. Contract: `Counter`.

| Action              | What it does                        |
| ------------------- | ----------------------------------- |
| `counter show`      | Read the current value              |
| `counter increment` | Increase the counter by one (write) |
| `counter decrement` | Decrease the counter by one (write) |

## greeter

A greeting string anyone may replace. Contract: `Greeter`.

| Action               | What it does                               |
| -------------------- | ------------------------------------------ |
| `greeter show`       | Read the current greeting and the deployer |
| `greeter set <text>` | Replace the greeting (write)               |

## guestbook

An append-only list of short signed messages. Contract: `Guestbook`.

| Action                       | What it does                 |
| ---------------------------- | ---------------------------- |
| `guestbook total`            | Count the entries            |
| `guestbook read <index>`     | Read one entry by index      |
| `guestbook list [--limit n]` | List the most recent entries |
| `guestbook sign <message>`   | Append a message (write)     |

## poll

A one-vote-per-address yes/no poll. Contract: `Poll`.

| Action                 | What it does                       |
| ---------------------- | ---------------------------------- |
| `poll show`            | Read the question and the tally    |
| `poll voted <address>` | Check whether an address has voted |
| `poll vote <yes        | no>`                               | Cast your vote (write) |

## registry

First-come, first-served names bound to an address. Contract: `NameRegistry`.

| Action                     | What it does                      |
| -------------------------- | --------------------------------- |
| `registry lookup <name>`   | Find who holds a name             |
| `registry of <address>`    | Find the name an address holds    |
| `registry register <name>` | Claim a free name (write)         |
| `registry release`         | Give up the name you hold (write) |

## todo

A per-address task list with one-way completion. Contract: `TodoList`.

| Action                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `todo list <address>`  | List an address's tasks                 |
| `todo count <address>` | Count an address's tasks, open and done |
| `todo add <text>`      | Append a task to your own list (write)  |
| `todo complete <id>`   | Mark one of your tasks done (write)     |

## kv

Per-address string storage under caller-chosen keys. Contract: `KeyValueStore`.

| Action                   | What it does                                  |
| ------------------------ | --------------------------------------------- |
| `kv get <address> <key>` | Read a value from an address's namespace      |
| `kv set <key> <value>`   | Write a value into your own namespace (write) |

## badge

A one-per-address, non-transferable claim record. Contract: `BuilderBadge`.

| Action                   | What it does                                |
| ------------------------ | ------------------------------------------- |
| `badge show`             | Read the badge metadata and the claim total |
| `badge status <address>` | Check whether an address has claimed        |
| `badge claim`            | Claim the badge for your address (write)    |

## attest

Timestamped attestations over a digest. Contract: `Attestation`.

| Action                            | What it does                                     |
| --------------------------------- | ------------------------------------------------ |
| `attest check <digest> <address>` | Look up whether an attester vouched for a digest |
| `attest add <digest>`             | Vouch for a digest under your address (write)    |

## versions

An append-only release log with strictly increasing versions. Contract: `VersionLog`.

| Action                               | What it does                                            |
| ------------------------------------ | ------------------------------------------------------- |
| `versions latest`                    | Read the most recent release                            |
| `versions total`                     | Count the published releases                            |
| `versions publish <version> <notes>` | Publish a release newer than the current latest (write) |

## whitelist

An owner-managed allowlist. Contract: `Whitelist`.

| Action                       | What it does                           |
| ---------------------------- | -------------------------------------- |
| `whitelist owner`            | Read the current owner                 |
| `whitelist check <address>`  | Check whether an address is allowed    |
| `whitelist allow <address>`  | Add an address (owner only) (write)    |
| `whitelist revoke <address>` | Remove an address (owner only) (write) |
