"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGlobPatterns = exports.isGlobPatternWithRoot = exports.isGlobPatternWithOptionalRoot = exports.isGlobPatternNormalized = exports.fileOrGlobToGlob = exports.GlobMatcher = void 0;
var GlobMatcher_1 = require("./GlobMatcher");
Object.defineProperty(exports, "GlobMatcher", { enumerable: true, get: function () { return GlobMatcher_1.GlobMatcher; } });
__exportStar(require("./GlobMatcherTypes"), exports);
var globHelper_1 = require("./globHelper");
Object.defineProperty(exports, "fileOrGlobToGlob", { enumerable: true, get: function () { return globHelper_1.fileOrGlobToGlob; } });
Object.defineProperty(exports, "isGlobPatternNormalized", { enumerable: true, get: function () { return globHelper_1.isGlobPatternNormalized; } });
Object.defineProperty(exports, "isGlobPatternWithOptionalRoot", { enumerable: true, get: function () { return globHelper_1.isGlobPatternWithOptionalRoot; } });
Object.defineProperty(exports, "isGlobPatternWithRoot", { enumerable: true, get: function () { return globHelper_1.isGlobPatternWithRoot; } });
Object.defineProperty(exports, "normalizeGlobPatterns", { enumerable: true, get: function () { return globHelper_1.normalizeGlobPatterns; } });
//# sourceMappingURL=index.js.map