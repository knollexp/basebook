// Addresses of the base-contracts deployment on Base mainnet.
// Source: https://github.com/knollexp/base-contracts/blob/main/docs/addresses.md
//
// These are immutable. Nothing upgrades or migrates them, so a redeploy
// produces new addresses rather than replacing these.
const BASE_MAINNET = {
  Attestation: "0x44DE54451feDeB5DBf9055f28Bc86E299247F129",
  BuilderBadge: "0x1f3053d41ba5DE86A2108Bcf75162B9D4158Dc1C",
  Counter: "0x933ecA2Aa56824F161c6F79e30bBc21b527Bc955",
  Greeter: "0x004281f907786aB52C7571D46705429C277E5763",
  Guestbook: "0x9cEd3Fd924CbEb965ACF19Bd5347D04395B5a230",
  KeyValueStore: "0x79f093E1ce2676e4205462cEfaB4f80486fA8b62",
  NameRegistry: "0xCebB51a8adE938fd76FF62dE391B00E0c91774c3",
  Poll: "0xFe32134fa5c229c505EaFC724C9F194E7458c0Ed",
  TodoList: "0x0292Fb832cF9569aa32C03AA0c1ED3B3c924e7e7",
  VersionLog: "0xF9AB59194cA951A75ca55b3f78B61f8d0Afc2A84",
  Whitelist: "0x2A504f8b9bd57AB469Ef3be82a0298Ea9edD58C0",
};

module.exports = { BASE_MAINNET };
