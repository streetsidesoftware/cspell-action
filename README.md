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
      - uses: actions/checkout@v4
      - uses: streetsidesoftware/cspell-action@v5
```

## Usage

```yaml
- uses: streetsidesoftware/cspell-action@v5
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
    #
    # To not check hidden files, use:
    # files: "**"
    #
    # Default: ALL files
    files: ''

    # Check files and directories starting with `.`.
    # - "true" - glob searches will match against `.dot` files.
    # - "false" - `.dot` files will NOT be checked.
    # - "explicit" - glob patterns can match explicit `.dot` patterns.
    check_dot_files: explicit

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

    # Limit the files checked to the ones in the pull request or push.
    incremental_files_only: true

    # Path to `cspell.json`
    config: '.'

    # Log progress and other information during the action execution.
    # Default: false
    verbose: false
```

## Yarn 2 - PlugNPlay

To use dictionaries stored within a Yarn 2 workspace, there are two choices:

1. Add `"usePnP": true` to the workspace `cspell.json` file. This tells `cspell` to search for the
   nearest `.pnp.js` or `.pnp.cjs` file and load it.

Example for medical terms:

```js
{
  "usePnP": true,
  "import": ["@cspell/dict-medicalterms/cspell-ext.json"]
}
```

2. Require the `.pnp.js` or `.pnp.cjs` in a `cspell.config.js` file.
   This must be done before importing any packages.

```js
'use strict';
require('./.pnp.js').setup(); // or './.pnp.cjs'

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
  description: 'Yarn 2 Aware cspell config',
  import: ['@cspell/dict-medicalterms/cspell-ext.json'],
};
module.exports = cspell;
```

## Outputs

```yaml
outputs:
  success:
    description: |
      "true" if no spelling issues were found, otherwise "false".
  number_of_files_checked:
    description: |
      The actual number of files that were checked.
  number_of_issues:
    description: |
      The number of issues found.
  number_of_files_with_issues:
    description: |
      The number of files that had issues.
  files_with_issues:
    description: |
      List of files with issues. Use `fromJSON()` to decode.
      The files are relative to the repository root.
  results:
    description: |
      The JSON encoded results.
```

Example Output:

```json
{
  "success": "false",
  "number_of_files_checked": "3",
  "number_of_issues": "2",
  "number_of_files_with_issues": "1",
  "files_with_issues": "[\"src/withErrors.ts\"]",
  "result": "{\"success\":false,\"number_of_issues\":2,\"number_of_files_checked\":3,\"files_with_issues\":[\"src/withErrors.ts\"]}"
}
```

<!---
cspell:ignore medicalterms

--->
