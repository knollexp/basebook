# Security

## Key handling

The CLI reads a key from `BASEBOOK_PRIVATE_KEY` or `PRIVATE_KEY`, in the
environment or in a gitignored `.env`. There is no `--key` flag, because an
argument lands in shell history.

The key is used to construct a signer and nothing else. It is never logged,
never written to disk by this tool, and read actions never touch it.

`.env` is in `.gitignore`. Keep it there.

## What this tool can do

Write actions send transactions from your address and spend gas. They are
marked `(write)` in `basebook help`, and refuse to run without a key rather
than silently doing nothing.

None of the target contracts are payable and none has a withdrawal path, so
no command here can move funds. The worst outcome is a wasted gas fee and a
row of bookkeeping you did not want.

## Scope

The contracts this talks to are unaudited. See
[base-contracts/SECURITY.md](https://github.com/knollexp/base-contracts/blob/main/SECURITY.md)
for their known limitations, which apply to anything written through this CLI:
guestbook entries and version log releases are permanent, name registration
can be front-run, and one address is one vote.

## Reporting

Open an issue.
