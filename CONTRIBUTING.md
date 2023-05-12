# Contributing

Contributions are welcome.

Layout

```
root
├── action.yaml
└── action-src
    ├── package.json
    ├── node_modules
    └── src
        └── *.ts
└── action
    ├── package.json
    ├── node_modules
    └── lib
        └── *.js

```

**action** is the compiled code used to run the action. The entire folder is in the source tree.
**action-src** is the source code for the action.

## Testing

Environment variable: `GITHUB_TOKEN` needs to be set to fully run the test.
