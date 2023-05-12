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
exports.__testing__ = exports.extractRangeText = exports.excludeRanges = exports.findMatchingRangesForPatterns = exports.unionRanges = exports.findMatchingRanges = void 0;
const GS = __importStar(require("gensequence"));
function toMatchRangeWithText(m) {
    const index = m.index || 0;
    const _text = m[0];
    return {
        startPos: index,
        endPos: index + _text.length,
        text: _text,
    };
}
function findMatchingRanges(pattern, text) {
    if (pattern.source === '.*') {
        return [{ startPos: 0, endPos: text.length }];
    }
    const regex = new RegExp(pattern);
    if (!regex.global) {
        const m = text.match(regex);
        if (!m)
            return [];
        return [toMatchRangeWithText(m)];
    }
    return [...text.matchAll(regex)].map(toMatchRangeWithText);
}
exports.findMatchingRanges = findMatchingRanges;
function compareRanges(a, b) {
    return a.startPos - b.startPos || a.endPos - b.endPos;
}
function unionRanges(ranges) {
    return makeSortedMatchRangeArray([..._unionRanges(ranges)]);
}
exports.unionRanges = unionRanges;
function* _unionRanges(ranges) {
    const sortedRanges = sortMatchRangeArray(ranges);
    if (!sortedRanges.length)
        return;
    let { startPos, endPos } = sortedRanges[0];
    for (const r of ranges) {
        if (r.startPos > endPos) {
            yield { startPos, endPos };
            startPos = r.startPos;
            endPos = r.endPos;
            continue;
        }
        endPos = Math.max(endPos, r.endPos);
    }
    if (startPos < endPos) {
        yield { startPos, endPos };
    }
}
function findMatchingRangesForPatterns(patterns, text) {
    const matchedPatterns = GS.genSequence(patterns).concatMap((pattern) => findMatchingRanges(pattern, text));
    return unionRanges(matchedPatterns.toArray());
}
exports.findMatchingRangesForPatterns = findMatchingRangesForPatterns;
/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
function excludeRanges(includeRanges, excludeRanges) {
    return [..._excludeRanges(sortMatchRangeArray(includeRanges), sortMatchRangeArray(excludeRanges))];
}
exports.excludeRanges = excludeRanges;
function* _excludeRanges(includeRanges, excludeRanges) {
    if (!includeRanges.length)
        return;
    if (!excludeRanges.length) {
        yield* includeRanges;
        return;
    }
    let exIndex = 0;
    const limit = excludeRanges.length;
    for (const incRange of includeRanges) {
        const endPos = incRange.endPos;
        let startPos = incRange.startPos;
        for (; exIndex < limit; ++exIndex) {
            const ex = excludeRanges[exIndex];
            if (ex.startPos >= endPos)
                break;
            if (ex.endPos <= startPos)
                continue;
            if (ex.startPos > startPos) {
                yield { startPos, endPos: ex.startPos };
            }
            startPos = ex.endPos;
            if (startPos >= endPos)
                break;
        }
        if (startPos < endPos) {
            yield { startPos, endPos };
        }
    }
}
function extractRangeText(text, ranges) {
    return ranges.map(({ startPos, endPos }) => ({
        startPos,
        endPos,
        text: text.slice(startPos, endPos),
    }));
}
exports.extractRangeText = extractRangeText;
const SymSortedMatchRangeArray = Symbol('SortedMatchRangeArray');
function sortMatchRangeArray(values) {
    if (isSortedMatchRangeArray(values))
        return values;
    return makeSortedMatchRangeArray(values.sort(compareRanges));
}
function isSortedMatchRangeArray(a) {
    return a[SymSortedMatchRangeArray] === true;
}
function makeSortedMatchRangeArray(sortedValues) {
    const sorted = sortedValues;
    sorted[SymSortedMatchRangeArray] = true;
    Object.freeze(sorted);
    return sorted;
}
exports.__testing__ = {
    makeSortedMatchRangeArray,
};
//# sourceMappingURL=TextRange.js.map