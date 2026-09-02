# Contributing

## Running the checks

```
npm ci
npm test
npm run format:check
node bin/basebook.js --version
```

CI runs the suite on Node 20, 22 and 24, a formatting check, and a job that
starts the entry point. All must pass.

## Adding a command

1. Add `src/commands/<name>.js` exporting `contract`, `summary` and `actions`.
2. Every action needs `usage`, `describe` and `run`. Mark the ones that send a
   transaction with `write: true` - the runner uses that to decide whether a
   key is required, so a missing marker means a write silently attempts to
   send from a provider.
3. Start the `usage` string with the command name. There is a test for this.
4. Register it in `src/commands/index.js`. The list is explicit on purpose.
5. Add `test/cmd-<name>.test.js`. Hand the action a stub contract; the suite
   is offline and should stay that way.
6. Run `npm run docs` and commit the regenerated reference.

## Argument handling

Use the helpers in `src/commands/util.js` rather than reading `args` directly.
They exist so that every command rejects a bad address, index or digest the
same way, and before a request is sent.

`bytes32` encodes a short label; `digest` does not. That difference is
deliberate: a mistyped hash must not be silently encoded into a valid-looking
attestation.

## Commits

One logical change per commit, and say why rather than what.
