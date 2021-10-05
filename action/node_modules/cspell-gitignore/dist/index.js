"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGitIgnore = exports.GitIgnoreHierarchy = exports.GitIgnoreFile = exports.isParentOf = exports.contains = exports.directoryRoot = exports.findRepoRoot = exports.GitIgnore = void 0;
var GitIgnore_1 = require("./GitIgnore");
Object.defineProperty(exports, "GitIgnore", { enumerable: true, get: function () { return GitIgnore_1.GitIgnore; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "findRepoRoot", { enumerable: true, get: function () { return helpers_1.findRepoRoot; } });
Object.defineProperty(exports, "directoryRoot", { enumerable: true, get: function () { return helpers_1.directoryRoot; } });
Object.defineProperty(exports, "contains", { enumerable: true, get: function () { return helpers_1.contains; } });
Object.defineProperty(exports, "isParentOf", { enumerable: true, get: function () { return helpers_1.isParentOf; } });
var GitIgnoreFile_1 = require("./GitIgnoreFile");
Object.defineProperty(exports, "GitIgnoreFile", { enumerable: true, get: function () { return GitIgnoreFile_1.GitIgnoreFile; } });
Object.defineProperty(exports, "GitIgnoreHierarchy", { enumerable: true, get: function () { return GitIgnoreFile_1.GitIgnoreHierarchy; } });
Object.defineProperty(exports, "loadGitIgnore", { enumerable: true, get: function () { return GitIgnoreFile_1.loadGitIgnore; } });
//# sourceMappingURL=index.js.map