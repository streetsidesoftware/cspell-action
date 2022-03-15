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
exports._testMethods = exports.mapLineSegmentAgainstRangesFactory = exports.hasWordCheck = exports.isWordValid = exports.lineValidatorFactory = exports.calcTextInclusionRanges = exports.validateText = exports.minWordSplitLen = exports.defaultMinWordLength = exports.defaultMaxDuplicateProblems = exports.defaultMaxNumberOfProblems = void 0;
const cspell_pipe_1 = require("@cspell/cspell-pipe");
const gensequence_1 = require("gensequence");
const RxPat = __importStar(require("../Settings/RegExpPatterns"));
const Text = __importStar(require("../util/text"));
const TextRange = __importStar(require("../util/TextRange"));
const util_1 = require("../util/util");
const wordSplitter_1 = require("../util/wordSplitter");
exports.defaultMaxNumberOfProblems = 200;
exports.defaultMaxDuplicateProblems = 5;
exports.defaultMinWordLength = 4;
exports.minWordSplitLen = 3;
function validateText(text, dict, options) {
    const { maxNumberOfProblems = exports.defaultMaxNumberOfProblems, maxDuplicateProblems = exports.defaultMaxDuplicateProblems } = options;
    const mapOfProblems = new Map();
    const includeRanges = calcTextInclusionRanges(text, options);
    const validator = lineValidatorFactory(dict, options);
    const iter = (0, cspell_pipe_1.pipeSync)(Text.extractLinesOfText(text), (0, cspell_pipe_1.opConcatMap)(mapLineToLineSegments(includeRanges)), (0, cspell_pipe_1.opConcatMap)(validator), (0, cspell_pipe_1.opFilter)((wo) => {
        const word = wo.text;
        // Keep track of the number of times we have seen the same problem
        const n = (mapOfProblems.get(word) || 0) + 1;
        mapOfProblems.set(word, n);
        // Filter out if there is too many
        return n <= maxDuplicateProblems;
    }), (0, cspell_pipe_1.opTake)(maxNumberOfProblems));
    return (0, gensequence_1.genSequence)(iter);
}
exports.validateText = validateText;
function calcTextInclusionRanges(text, options) {
    const { ignoreRegExpList = [], includeRegExpList = [] } = options;
    const filteredIncludeList = includeRegExpList.filter((a) => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : [/.*/gim];
    const includeRanges = TextRange.excludeRanges(TextRange.findMatchingRangesForPatterns(finalIncludeList, text), TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text));
    return includeRanges;
}
exports.calcTextInclusionRanges = calcTextInclusionRanges;
function lineValidatorFactory(dict, options) {
    const { minWordLength = exports.defaultMinWordLength, flagWords = [], allowCompoundWords = false, ignoreCase = true, } = options;
    const hasWordOptions = {
        ignoreCase,
        useCompounds: allowCompoundWords || undefined, // let the dictionaries decide on useCompounds if allow is false
    };
    const dictCol = dict;
    const setOfFlagWords = new Set(flagWords);
    const setOfKnownSuccessfulWords = new Set();
    const rememberFilter = (fn) => (v) => {
        const keep = fn(v);
        if (!keep) {
            setOfKnownSuccessfulWords.add(v.text);
        }
        return keep;
    };
    const filterAlreadyChecked = (wo) => {
        return !setOfKnownSuccessfulWords.has(wo.text);
    };
    function testForFlaggedWord(wo) {
        const text = wo.text;
        return setOfFlagWords.has(text) || setOfFlagWords.has(text.toLowerCase()) || dictCol.isForbidden(text);
    }
    function isWordIgnored(word) {
        return dict.isNoSuggestWord(word, options);
    }
    function isWordFlagged(word) {
        const isIgnored = isWordIgnored(word.text);
        const isFlagged = !isIgnored && testForFlaggedWord(word);
        return isFlagged;
    }
    function checkFlagWords(word) {
        word.isFlagged = isWordFlagged(word);
        return word;
    }
    function checkWord(word, options) {
        const isIgnored = isWordIgnored(word.text);
        const { isFlagged = !isIgnored && testForFlaggedWord(word) } = word;
        const isFound = isFlagged ? undefined : isIgnored || isWordValid(dictCol, word, word.line, options);
        return (0, util_1.clean)({ ...word, isFlagged, isFound });
    }
    const fn = (lineSegment) => {
        function splitterIsValid(word) {
            return (setOfKnownSuccessfulWords.has(word.text) ||
                (!testForFlaggedWord(word) && isWordValid(dictCol, word, lineSegment.line, hasWordOptions)));
        }
        function checkFullWord(vr) {
            if (vr.isFlagged) {
                return [vr];
            }
            const codeWordResults = (0, cspell_pipe_1.toArray)((0, cspell_pipe_1.pipeSync)(Text.extractWordsFromCodeTextOffset(vr), (0, cspell_pipe_1.opFilter)(filterAlreadyChecked), (0, cspell_pipe_1.opMap)((t) => ({ ...t, line: vr.line })), (0, cspell_pipe_1.opMap)(checkFlagWords), (0, cspell_pipe_1.opFilter)(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)), (0, cspell_pipe_1.opMap)((wo) => (wo.isFlagged ? wo : checkWord(wo, hasWordOptions))), (0, cspell_pipe_1.opFilter)(rememberFilter((wo) => wo.isFlagged || !wo.isFound)), (0, cspell_pipe_1.opFilter)(rememberFilter((wo) => !RxPat.regExRepeatedChar.test(wo.text))), // Filter out any repeated characters like xxxxxxxxxx
            // get back the original text.
            (0, cspell_pipe_1.opMap)((wo) => ({
                ...wo,
                text: Text.extractText(lineSegment.segment, wo.offset, wo.offset + wo.text.length),
            }))));
            if (!codeWordResults.length || isWordIgnored(vr.text) || checkWord(vr, hasWordOptions).isFound) {
                rememberFilter((_) => false)(vr);
                return [];
            }
            return codeWordResults;
        }
        function checkPossibleWords(possibleWord) {
            if (isWordFlagged(possibleWord)) {
                const vr = {
                    ...possibleWord,
                    line: lineSegment.line,
                    isFlagged: true,
                };
                return [vr];
            }
            const mismatches = (0, cspell_pipe_1.toArray)((0, cspell_pipe_1.pipeSync)(Text.extractWordsFromTextOffset(possibleWord), (0, cspell_pipe_1.opFilter)(filterAlreadyChecked), (0, cspell_pipe_1.opMap)((wo) => ({ ...wo, line: lineSegment.line })), (0, cspell_pipe_1.opMap)(checkFlagWords), (0, cspell_pipe_1.opFilter)(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)), (0, cspell_pipe_1.opConcatMap)(checkFullWord)));
            if (mismatches.length) {
                // Try the more expensive word splitter
                const splitResult = (0, wordSplitter_1.split)(lineSegment.segment, possibleWord.offset, splitterIsValid);
                const nonMatching = splitResult.words.filter((w) => !w.isFound);
                if (nonMatching.length < mismatches.length) {
                    return nonMatching.map((w) => ({ ...w, line: lineSegment.line })).map(checkFlagWords);
                }
            }
            return mismatches;
        }
        const checkedPossibleWords = (0, gensequence_1.genSequence)((0, cspell_pipe_1.pipeSync)(Text.extractPossibleWordsFromTextOffset(lineSegment.segment), (0, cspell_pipe_1.opFilter)(filterAlreadyChecked), (0, cspell_pipe_1.opConcatMap)(checkPossibleWords)));
        return checkedPossibleWords;
    };
    return fn;
}
exports.lineValidatorFactory = lineValidatorFactory;
function isWordValid(dict, wo, line, options) {
    const firstTry = hasWordCheck(dict, wo.text, options);
    return (firstTry ||
        // Drop the first letter if it is preceded by a '\'.
        (line.text[wo.offset - line.offset - 1] === '\\' && hasWordCheck(dict, wo.text.slice(1), options)));
}
exports.isWordValid = isWordValid;
function hasWordCheck(dict, word, options) {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return dict.has(word, convertCheckOptionsToHasOptions(options));
}
exports.hasWordCheck = hasWordCheck;
function convertCheckOptionsToHasOptions(opt) {
    const { ignoreCase, useCompounds } = opt;
    return (0, util_1.clean)({
        ignoreCase,
        useCompounds,
    });
}
function mapLineToLineSegments(includeRanges) {
    const mapAgainstRanges = mapLineSegmentAgainstRangesFactory(includeRanges);
    return (line) => {
        const segment = { line, segment: line };
        return mapAgainstRanges(segment);
    };
}
/**
 * Returns a mapper function that will segment a TextOffset based upon the includeRanges.
 * This function is optimized for forward scanning. It will perform poorly for randomly ordered offsets.
 * @param includeRanges Allowed ranges for words.
 */
function mapLineSegmentAgainstRangesFactory(includeRanges) {
    let rangePos = 0;
    const mapper = (lineSeg) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts = [];
        const { segment, line } = lineSeg;
        const { text, offset, length } = segment;
        const textEndPos = offset + (length !== null && length !== void 0 ? length : text.length);
        let textStartPos = offset;
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > textStartPos)) {
            rangePos -= 1;
        }
        const cur = includeRanges[rangePos];
        if (textEndPos <= cur.endPos && textStartPos >= cur.startPos) {
            return [lineSeg];
        }
        while (textStartPos < textEndPos) {
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= textStartPos) {
                rangePos += 1;
            }
            if (!includeRanges[rangePos]) {
                break;
            }
            const { startPos, endPos } = includeRanges[rangePos];
            if (textEndPos < startPos) {
                break;
            }
            const a = Math.max(textStartPos, startPos);
            const b = Math.min(textEndPos, endPos);
            if (a !== b) {
                parts.push({ line, segment: { offset: a, text: text.slice(a - offset, b - offset) } });
            }
            textStartPos = b;
        }
        return parts;
    };
    return mapper;
}
exports.mapLineSegmentAgainstRangesFactory = mapLineSegmentAgainstRangesFactory;
exports._testMethods = {
    mapWordsAgainstRanges: mapLineSegmentAgainstRangesFactory,
};
//# sourceMappingURL=textValidator.js.map