"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSpellingDictionaryLoadError = exports.SpellingDictionaryLoadError = void 0;
class SpellingDictionaryLoadError extends Error {
    constructor(uri, options, cause, message) {
        super(message);
        this.uri = uri;
        this.options = options;
        this.cause = cause;
        this.name = options.name;
    }
}
exports.SpellingDictionaryLoadError = SpellingDictionaryLoadError;
function isSpellingDictionaryLoadError(e) {
    return e instanceof SpellingDictionaryLoadError;
}
exports.isSpellingDictionaryLoadError = isSpellingDictionaryLoadError;
//# sourceMappingURL=SpellingDictionaryError.js.map