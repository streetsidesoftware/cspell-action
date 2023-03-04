"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundWordsMethod = exports.WORD_SEPARATOR = exports.JOIN_SEPARATOR = void 0;
exports.JOIN_SEPARATOR = '+';
exports.WORD_SEPARATOR = ' ';
var CompoundWordsMethod;
(function (CompoundWordsMethod) {
    /**
     * Do not compound words.
     */
    CompoundWordsMethod[CompoundWordsMethod["NONE"] = 0] = "NONE";
    /**
     * Create word compounds separated by spaces.
     */
    CompoundWordsMethod[CompoundWordsMethod["SEPARATE_WORDS"] = 1] = "SEPARATE_WORDS";
    /**
     * Create word compounds without separation.
     */
    CompoundWordsMethod[CompoundWordsMethod["JOIN_WORDS"] = 2] = "JOIN_WORDS";
})(CompoundWordsMethod = exports.CompoundWordsMethod || (exports.CompoundWordsMethod = {}));
//# sourceMappingURL=walkerTypes.js.map