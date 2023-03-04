"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTrieOptions = exports.IDENTITY_PREFIX = exports.LINE_COMMENT = exports.FORBID_PREFIX = exports.CASE_INSENSITIVE_PREFIX = exports.OPTIONAL_COMPOUND_FIX = exports.COMPOUND_FIX = void 0;
exports.COMPOUND_FIX = '+';
exports.OPTIONAL_COMPOUND_FIX = '*';
exports.CASE_INSENSITIVE_PREFIX = '~';
exports.FORBID_PREFIX = '!';
exports.LINE_COMMENT = '#';
exports.IDENTITY_PREFIX = '=';
exports.defaultTrieOptions = Object.freeze({
    compoundCharacter: exports.COMPOUND_FIX,
    forbiddenWordPrefix: exports.FORBID_PREFIX,
    stripCaseAndAccentsPrefix: exports.CASE_INSENSITIVE_PREFIX,
});
//# sourceMappingURL=constants.js.map