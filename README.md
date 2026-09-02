# basebook

[![CI](https://github.com/knollexp/basebook/actions/workflows/ci.yml/badge.svg)](https://github.com/knollexp/basebook/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A CLI for the eleven contracts from
[base-contracts](https://github.com/knollexp/base-contracts), live on Base
mainnet. Reads need nothing but a network connection; writes need a key.

`ethers` is the only runtime dependency.

## Install

```
npm install
npm link          # optional, puts basebook on your PATH
```

Or run it in place:

```
node bin/basebook.js help
```

## Use

```
basebook counter show
basebook greeter show
basebook registry lookup alice
basebook guestbook list --limit 5
basebook poll show --json
```

Every command prints a table by default and JSON with `--json`. Both are
rendered from the same values, so they cannot disagree.

Writing needs a key in the environment or in `.env`:

```
BASEBOOK_PRIVATE_KEY=0x...
```

```
basebook counter increment
basebook registry register alice
basebook guestbook sign "gm"
```

There is deliberately no `--key` flag. A key passed as an argument ends up in
shell history.

See [docs/commands.md](docs/commands.md) for every command, or run
`basebook help <command>`.

## Flags

| Flag               | Meaning                                 |
| ------------------ | --------------------------------------- |
| `--network <name>` | `base` (default) or `sepolia`           |
| `--rpc <url>`      | RPC endpoint, overriding the public one |
| `--json`           | Emit JSON instead of a table            |
| `--limit <n>`      | Row limit for listing actions           |

The public Base endpoint rate-limits bursts. If you script this, pass `--rpc`
or set `BASEBOOK_RPC_URL`; a throttled call returns no data and the CLI will
tell you so rather than blaming the contract.

## Exit codes

| Code | Meaning                                                 |
| ---- | ------------------------------------------------------- |
| 0    | Success                                                 |
| 2    | Usage error: unknown command, bad argument, missing key |
| 3    | Chain error: revert, unreachable endpoint               |

Usage errors are detected before any request is sent, so a typo costs no
round trip.

## Tests

```
npm test
```

The suite is entirely offline. Commands take a contract-shaped object, so the
tests hand them stubs rather than reaching Base.

## Layout

```
bin/            Entry point
src/            Argument parsing, network and address resolution, rendering
src/commands/   One module per contract, plus the registry
abi/            Contract interfaces, copied from base-contracts
docs/           Generated command reference
```

## License

MIT. See [LICENSE](LICENSE).
