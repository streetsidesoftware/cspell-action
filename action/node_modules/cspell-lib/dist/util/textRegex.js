"use strict";
// cspell:ignore ings ning gimuy anrvtbf
Object.defineProperty(exports, "__esModule", { value: true });
exports.regExTrailingEndings = exports.regExDanglingQuote = exports.regExEscapeCharacters = exports.regExAccents = exports.regExMatchRegExParts = exports.regExPossibleWordBreaks = exports.regExAllLower = exports.regExAllUpper = exports.regExFirstUpper = exports.regExIgnoreCharacters = exports.regExWordsAndDigits = exports.regExWords = exports.regExSplitWords2 = exports.regExSplitWords = exports.regExUpperSOrIng = exports.regExLines = void 0;
exports.regExLines = /.*(\r?\n|$)/g;
exports.regExUpperSOrIng = /([\p{Lu}\p{M}]+\\?['’]?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
exports.regExSplitWords = /(\p{Ll}\p{M}?)(\p{Lu})/gu;
exports.regExSplitWords2 = /(\p{Lu}\p{M}?)(\p{Lu}\p{M}?\p{Ll})/gu;
exports.regExWords = /\p{L}\p{M}?(?:(?:\\?['’])?\p{L}\p{M}?)*/gu;
exports.regExWordsAndDigits = /(?:\d+)?[\p{L}\p{M}_'’-](?:(?:\\?['’])?[\p{L}\p{M}\w'’-])*/gu;
exports.regExIgnoreCharacters = /[\p{sc=Hiragana}\p{sc=Han}\p{sc=Katakana}\u30A0-\u30FF\p{sc=Hangul}]/gu;
exports.regExFirstUpper = /^\p{Lu}\p{M}?\p{Ll}+$/u;
exports.regExAllUpper = /^(?:\p{Lu}\p{M}?)+$/u;
exports.regExAllLower = /^(?:\p{Ll}\p{M}?)+$/u;
exports.regExPossibleWordBreaks = /[-_’']/g;
exports.regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;
exports.regExAccents = /\p{M}/gu;
exports.regExEscapeCharacters = /(?<=\\)[anrvtbf]/gi;
/** Matches against leading `'` or `{single letter}'` */
exports.regExDanglingQuote = /(?<=(?:^|(?!\p{M})\P{L})(?:\p{L}\p{M}?)?)[']/gu;
/** Match tailing endings after CAPS words */
exports.regExTrailingEndings = /(?<=(?:\p{Lu}\p{M}?){2})['’]?(?:s|d|ings?|ies|e[ds]?|ning|th|nth)(?!\p{Ll})/gu;
//# sourceMappingURL=textRegex.js.map