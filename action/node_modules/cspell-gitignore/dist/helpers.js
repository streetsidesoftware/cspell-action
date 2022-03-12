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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contains = exports.isParentOf = exports.findRepoRoot = exports.directoryRoot = void 0;
const path = __importStar(require("path"));
const findUp = require("find-up");
/**
 * Parse a directory and return its root
 * @param directory - directory to parse.
 * @returns root directory
 */
function directoryRoot(directory) {
    const p = path.parse(directory);
    return p.root;
}
exports.directoryRoot = directoryRoot;
/**
 * Find the git repository root directory.
 * @param directory - directory to search up from.
 * @returns resolves to `.git` root or undefined
 */
async function findRepoRoot(directory) {
    const found = await findUp('.git', { cwd: directory, type: 'directory' });
    if (!found)
        return undefined;
    return path.dirname(found);
}
exports.findRepoRoot = findRepoRoot;
/**
 * Checks to see if the child directory is nested under the parent directory.
 * @param parent - parent directory
 * @param child - possible child directory
 * @returns true iff child is a child of parent.
 */
function isParentOf(parent, child) {
    const rel = path.relative(parent, child);
    return !!rel && !path.isAbsolute(rel) && rel[0] !== '.';
}
exports.isParentOf = isParentOf;
/**
 * Check to see if a parent directory contains a child directory.
 * @param parent - parent directory
 * @param child - child directory
 * @returns true iff child is the same as the parent or nested in the parent.
 */
function contains(parent, child) {
    const rel = path.relative(parent, child);
    return !rel || (!path.isAbsolute(rel) && rel[0] !== '.');
}
exports.contains = contains;
//# sourceMappingURL=helpers.js.map