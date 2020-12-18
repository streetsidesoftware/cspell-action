# cspell-action

Uses [cspell](https://github.com/streetsidesoftware/cspell/tree/master/packages/cspell) to check code.

## Installation

Example `spellcheck.yaml`

```yaml
name: 'Check spelling'
on: # rebuild any PRs and main branch changes
  pull_request:
  push:

jobs:
  spellcheck: # run the action
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: streetsidesoftware/cspell-action@v0.2.3
```
