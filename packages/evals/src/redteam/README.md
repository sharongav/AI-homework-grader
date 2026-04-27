# Red Team Eval Suite

This directory contains golden-set test cases for prompt injection defense.

Per §9.1: CI gates merges on 100% defense pass rate on this suite.
Any new injection technique observed in the wild must be added as a test case.

## Test Categories
- `direct-commands/` — Direct instruction overrides
- `roleplay/` — Role-play and persona bypass attempts
- `delimiter-spoofing/` — Attempts to close/reopen XML tags
- `code-comments/` — Instructions hidden in code comments
- `markdown-smuggling/` — Instructions in markdown formatting
- `notebook-outputs/` — Instructions in Jupyter cell outputs
- `image-text/` — Instructions rendered as text in images
- `filename-injection/` — Malicious filenames
