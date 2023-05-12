"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegEx = void 0;
/**
 * Escape a string so it can be used as an exact match within a RegExp.
 * @param s - string to escape
 * @returns - the escaped string.
 */
function escapeRegEx(s) {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}
exports.escapeRegEx = escapeRegEx;
//# sourceMappingURL=regexHelper.js.map