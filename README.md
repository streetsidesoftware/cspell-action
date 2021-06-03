# cspell-action

Uses [cspell](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell) to check code.

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
      - uses: streetsidesoftware/cspell-action@v1.0.1
```

## Usage

```yaml
- uses: streetsidesoftware/cspell-action@v1.0.1
  with:
    # Github token used to fetch the list of changed files in the commit.
    # Default: ${{ github.token }}
    github_token: ''

    # Define glob patterns to filter the files to be checked. Use a new line between patterns to define multiple patterns.
    # The default is to check ALL files that were changed in in the pull_request or push.
    # Note: `ignorePaths` defined in cspell.json still apply.
    # Example:
    # files: |
    #   **/*.{ts,js}
    #   !dist/**/*.{ts,js}
    #   # Hidden directories need an explicit .* to be included
    #   .*/**/*.yml
    # Default **/*
    files: ''

    # The point in the directory tree to start spell checking.
    # Default: .
    root: '.'

    # Notification level to use with inline reporting of spelling errors.
    # Allowed values are: warning, error, none
    # Default: warning
    inline: warning

    # Determines if the action should be failed if any spelling issues are found.
    # Allowed values are: true, false
    # Default: true
    strict: true
```
