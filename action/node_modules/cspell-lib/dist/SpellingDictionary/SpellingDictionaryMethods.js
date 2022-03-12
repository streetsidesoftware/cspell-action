"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__testMethods = exports.createWeightMapFromDictionaryInformation = exports.suggestArgsToSuggestOptions = exports.hasOptionToSearchOption = exports.wordDictionaryFormsCollector = exports.wordSuggestForms = exports.wordSuggestFormsArray = exports.wordSearchForms = exports.wordSearchFormsArray = exports.defaultNumSuggestions = exports.suggestionCollector = exports.impersonateCollector = void 0;
const cspell_trie_lib_1 = require("cspell-trie-lib");
const trie_util_1 = require("cspell-trie-lib/dist/lib/trie-util");
const gensequence_1 = require("gensequence");
const text_1 = require("../util/text");
var cspell_trie_lib_2 = require("cspell-trie-lib");
Object.defineProperty(exports, "impersonateCollector", { enumerable: true, get: function () { return cspell_trie_lib_2.impersonateCollector; } });
Object.defineProperty(exports, "suggestionCollector", { enumerable: true, get: function () { return cspell_trie_lib_2.suggestionCollector; } });
exports.defaultNumSuggestions = 10;
function wordSearchFormsArray(word, isDictionaryCaseSensitive, ignoreCase) {
    return [...wordSearchForms(word, isDictionaryCaseSensitive, ignoreCase)];
}
exports.wordSearchFormsArray = wordSearchFormsArray;
function wordSearchForms(word, isDictionaryCaseSensitive, ignoreCase) {
    const forms = new Set();
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    if (ignoreCase) {
        if (isDictionaryCaseSensitive) {
            forms.add(wordLc);
        }
        else {
            forms.add(wordLc);
            // Legacy remove any unbound accents
            forms.add(wordLc.replace(/\p{M}/gu, ''));
        }
    }
    else {
        if (isDictionaryCaseSensitive) {
            forms.add(word);
            forms.add(wordLc);
            // HOUSE -> House, house
            if ((0, text_1.isUpperCase)(word)) {
                forms.add((0, text_1.ucFirst)(wordLc));
            }
        }
        else {
            forms.add(wordLc);
            // Legacy remove any unbound accents
            forms.add(wordLc.replace(/\p{M}/gu, ''));
        }
    }
    return forms;
}
exports.wordSearchForms = wordSearchForms;
function wordSuggestFormsArray(word) {
    return [...wordSuggestForms(word)];
}
exports.wordSuggestFormsArray = wordSuggestFormsArray;
function wordSuggestForms(word) {
    word = word.normalize('NFC');
    const forms = new Set([word]);
    const wordLc = word.toLowerCase();
    forms.add(wordLc);
    return forms;
}
exports.wordSuggestForms = wordSuggestForms;
function* wordDictionaryForms(word, prefixNoCase) {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = (0, text_1.removeAccents)(word);
    const wordLcNa = (0, text_1.removeAccents)(wordLc);
    function wf(w, p = '') {
        return { w, p };
    }
    const prefix = prefixNoCase;
    yield wf(word);
    yield wf(wordNa, prefix);
    yield wf(wordLc, prefix);
    yield wf(wordLcNa, prefix);
}
function wordDictionaryFormsCollector(prefixNoCase) {
    const knownWords = new Set();
    return (word) => {
        return (0, gensequence_1.genSequence)(wordDictionaryForms(word, prefixNoCase))
            .filter((w) => !knownWords.has(w.w))
            .map((w) => w.p + w.w)
            .filter((w) => !knownWords.has(w))
            .map((w) => (knownWords.add(w), w));
    };
}
exports.wordDictionaryFormsCollector = wordDictionaryFormsCollector;
function hasOptionToSearchOption(opt) {
    return !opt ? {} : opt;
}
exports.hasOptionToSearchOption = hasOptionToSearchOption;
function suggestArgsToSuggestOptions(args) {
    const [_word, options, compoundMethod, numChanges, ignoreCase] = args;
    const suggestOptions = typeof options === 'object'
        ? options
        : (0, trie_util_1.clean)({
            numSuggestions: options,
            compoundMethod,
            numChanges,
            ignoreCase,
            includeTies: undefined,
            timeout: undefined,
        });
    return suggestOptions;
}
exports.suggestArgsToSuggestOptions = suggestArgsToSuggestOptions;
function createWeightMapFromDictionaryInformation(di) {
    return di ? (0, cspell_trie_lib_1.mapDictionaryInformationToWeightMap)(di) : undefined;
}
exports.createWeightMapFromDictionaryInformation = createWeightMapFromDictionaryInformation;
exports.__testMethods = {
    wordSearchForms,
    wordSearchFormsArray,
    wordDictionaryForms,
    wordDictionaryFormsCollector,
};
//# sourceMappingURL=SpellingDictionaryMethods.js.map