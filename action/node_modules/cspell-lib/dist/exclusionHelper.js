"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExclusionFunctionForFiles = exports.generateExclusionFunctionForUri = exports.extractGlobsFromExcludeFilesGlobMap = void 0;
const vscode_uri_1 = require("vscode-uri");
const cspell_glob_1 = require("cspell-glob");
const defaultAllowedSchemes = new Set(['file', 'untitled']);
function extractGlobsFromExcludeFilesGlobMap(globMap) {
    const globs = Object.getOwnPropertyNames(globMap).filter((glob) => globMap[glob]);
    return globs;
}
exports.extractGlobsFromExcludeFilesGlobMap = extractGlobsFromExcludeFilesGlobMap;
const leadingGlobPattern = /^\*\*\/([^/*{}]+)$/;
function adjustGlobPatternForBackwardsCompatibility(g) {
    return g.replace(leadingGlobPattern, '**/{$1,$1/**}');
}
function adjustGlobPatternsForBackwardsCompatibility(globs) {
    return globs.map((g) => {
        if (typeof g === 'string') {
            return adjustGlobPatternForBackwardsCompatibility(g);
        }
        return { ...g, glob: adjustGlobPatternForBackwardsCompatibility(g.glob) };
    });
}
/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
function generateExclusionFunctionForUri(globs, root, allowedSchemes = defaultAllowedSchemes) {
    const adjustedGlobs = adjustGlobPatternsForBackwardsCompatibility(globs);
    const matchFn = generateExclusionFunctionForFiles(adjustedGlobs, root);
    function testUri(uri) {
        if (!allowedSchemes.has(uri.scheme)) {
            return true;
        }
        return matchFn(uri.scheme === 'file' ? uri.fsPath : uri.path);
    }
    function testUriPath(uriPath) {
        const uri = vscode_uri_1.URI.parse(uriPath);
        return testUri(uri);
    }
    return testUriPath;
}
exports.generateExclusionFunctionForUri = generateExclusionFunctionForUri;
/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
function generateExclusionFunctionForFiles(globs, root) {
    const matcher = new cspell_glob_1.GlobMatcher(globs, { root, dot: true });
    return (file) => matcher.match(file);
}
exports.generateExclusionFunctionForFiles = generateExclusionFunctionForFiles;
//# sourceMappingURL=exclusionHelper.js.map