// This file is used by esbuild to provide a CJS-compatible way to access import.meta.url
// Related to: https://github.com/thecodrr/fdir/issues/163

// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
export var import_meta_url = require('url').pathToFileURL(__filename);
