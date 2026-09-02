# Changelog

## 0.1.0

First release.

### Commands

One module per contract, eleven in total: `counter`, `greeter`, `guestbook`,
`poll`, `registry`, `todo`, `kv`, `badge`, `attest`, `versions`, `whitelist`.
See [docs/commands.md](docs/commands.md).

### Behaviour worth knowing

- Reads need no key. Writes are marked `(write)` and refuse to run without one.
- Usage errors are caught before any request is sent and exit 2; chain errors
  exit 3.
- A throttled request is reported as throttling rather than as a revert. The
  public Base endpoint rate-limits bursts, and the first version of the error
  mapping blamed the contract for it.
- `--json` and the table output are rendered from the same values.

### Tests

232 tests, entirely offline. Commands receive a contract-shaped stub.

### Known gaps

- No integration test against live Base. The read commands were exercised
  manually against the deployed contracts; nothing automated does that yet.
- Sepolia is a known network but has no address book, since the contracts were
  only ever deployed to mainnet.
