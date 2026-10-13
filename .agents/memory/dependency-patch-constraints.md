---
name: Dependency patch constraints
description: Constraints for fixing transitive vulnerabilities without breaking Expo tools or hiding scanner findings.
---

When an upstream package has no fixed release, use a tracked pnpm patch and
behavioral regression tests; do not invent a new version or suppress the advisory.

**Why:** Version-only dependency audits continue reporting the original package
version even after a verified local security fix. A clean scan cannot be achieved
honestly through version metadata alone until an official release exists.

**How to apply:** Distinguish patched code from residual scanner findings in
completion reports. Replace patches with official fixes when available.

Check module-format compatibility before overriding old transitive dependencies.

**Why:** Expo tooling uses CommonJS consumers for UUID generation and query
decoding, while newer upstream releases have switched to ESM-only exports.
An override can install successfully and typecheck while still breaking runtime.

**How to apply:** Test through the actual parent package's require/import path.
Prefer a maintained CommonJS-compatible fixed release; if none exists, keep the
fixed upstream algorithm and patch only its module interface.
