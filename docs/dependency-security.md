# Dependency security maintenance

Run `pnpm install --frozen-lockfile`, `pnpm test:dependency-security`, and
`pnpm typecheck` to verify the dependency fixes and compatibility.

## Upgraded packages

| Package | Fixed version |
| --- | --- |
| proxy-addr | 2.0.8 |
| source-map-js | 1.2.2 |
| brace-expansion | 5.0.12 (covers all three listed advisories) |
| uuid | 11.1.1 |
| fast-uri | 3.1.8 |
| decode-uri-component | 0.5.0 |

`uuid` is restricted to the patched CommonJS-compatible 11.x line because
Expo's `xcode` dependency uses `require()`. `decode-uri-component` 0.5.0 has
the upstream fixed decoding algorithm; its tracked patch changes only the
module format to CommonJS for Expo Router's `query-string` 7 consumer.

## Packages with no published fixed release as of 2026-10-12

These use pnpm's `patchedDependencies`. The committed patch files and lockfile
hashes ensure the fixes are reapplied on clean installs. Package versions are
not falsified and security findings are not suppressed.

- **braces 3.0.3 — GHSA-vfj7-8cjw-p6xm:** the parser rejects brace and parenthesis
  nesting at 128 stack entries before recursive processing, including malformed
  unclosed patterns. An iterative depth check also protects compile, expand,
  and stringify when the caller supplies an AST directly. Excessive nesting
  produces a deliberate `SyntaxError`, following the existing invalid-input
  error behavior rather than exhausting the native stack.
- **node-forge 1.4.0 — GHSA-86w9-cpqp-85rv:** backports the nested DigestAlgorithm
  element-count validation proposed in
  [upstream PR 1152](https://github.com/digitalbazaar/forge/pull/1152).
  Both the outer DigestInfo and nested algorithm sequence must contain exactly
  the consumed elements. Tests exercise valid RSA signatures and malicious
  nested sequences, including a low-exponent RSA key.

Version-only vulnerability scanners still report these two patched versions.
Those reports remain visible; the regression suite verifies the patched behavior.
Replace the local patches with official fixed releases when they become available,
then rerun the tests and dependency audit.
