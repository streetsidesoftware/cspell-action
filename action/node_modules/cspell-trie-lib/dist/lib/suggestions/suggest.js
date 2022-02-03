"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genCompoundableSuggestions = exports.genSuggestions = exports.suggest = void 0;
const trie_util_1 = require("../trie-util");
const genSuggestionsOptions_1 = require("./genSuggestionsOptions");
const orthography_1 = require("./orthography");
const suggestCollector_1 = require("./suggestCollector");
const walker_1 = require("./walker");
const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const insertSpaceCost = -1;
const mapSubCost = 1;
const maxCostScale = 0.5;
const discourageInsertCost = baseCost;
const setOfSeparators = new Set([walker_1.JOIN_SEPARATOR, walker_1.WORD_SEPARATOR]);
function suggest(root, word, options = {}) {
    const opts = (0, genSuggestionsOptions_1.createSuggestionOptions)(options);
    const collectorOpts = (0, trie_util_1.clean)(opts);
    const collector = (0, suggestCollector_1.suggestionCollector)(word, collectorOpts);
    collector.collect(genSuggestions(root, word, { ...opts, ...collector.genSuggestionOptions }));
    return collector.suggestions;
}
exports.suggest = suggest;
function* genSuggestions(root, word, options = {}) {
    const roots = Array.isArray(root) ? root : [root];
    for (const r of roots) {
        yield* genCompoundableSuggestions(r, word, options);
    }
    return undefined;
}
exports.genSuggestions = genSuggestions;
function* genCompoundableSuggestions(root, word, options = {}) {
    const { compoundMethod = walker_1.CompoundWordsMethod.NONE, changeLimit, ignoreCase } = (0, genSuggestionsOptions_1.createSuggestionOptions)(options);
    const history = [];
    const historyTags = new Map();
    const bc = baseCost;
    const psc = postSwapCost;
    const matrix = [[]];
    const stack = [];
    const x = ' ' + word;
    const mx = x.length - 1;
    const specialInsCosts = Object.assign(Object.create(null), {
        [walker_1.WORD_SEPARATOR]: insertSpaceCost,
        [walker_1.JOIN_SEPARATOR]: insertSpaceCost,
    });
    const specialSubCosts = Object.assign(Object.create(null), {
        '-': discourageInsertCost,
    });
    let stopNow = false;
    let costLimit = bc * Math.min(word.length * maxCostScale, changeLimit);
    function updateCostLimit(maxCost) {
        switch (typeof maxCost) {
            case 'number':
                costLimit = maxCost;
                break;
            case 'symbol':
                stopNow = true;
                break;
        }
    }
    const a = 0;
    let b = 0;
    for (let i = 0, c = 0; i <= mx && c <= costLimit; ++i) {
        c = i * baseCost;
        matrix[0][i] = c;
        b = i;
    }
    stack[0] = { a, b };
    const hint = word;
    const iWalk = (0, walker_1.hintedWalker)(root, ignoreCase, hint, compoundMethod, options.compoundSeparator);
    let goDeeper = true;
    for (let r = iWalk.next({ goDeeper }); !stopNow && !r.done; r = iWalk.next({ goDeeper })) {
        const { text, node, depth } = r.value;
        let { a, b } = stack[depth];
        /** Current character from word */
        const w = text.slice(-1);
        /** Current character visual letter group */
        const wG = orthography_1.visualLetterMaskMap[w] || 0;
        if (setOfSeparators.has(w)) {
            const mxRange = matrix[depth].slice(a, b + 1);
            const mxMin = Math.min(...mxRange);
            const tag = [a].concat(mxRange.map((c) => c - mxMin)).join();
            const ht = historyTags.get(tag);
            if (ht && ht.m <= mxMin) {
                goDeeper = false;
                const { i, w, m } = ht;
                if (i >= history.length) {
                    continue;
                }
                const r = history[i];
                if (r.word.slice(0, w.length) !== w) {
                    continue;
                }
                const dc = mxMin - m;
                for (let p = i; p < history.length; ++p) {
                    const { word, cost: hCost } = history[p];
                    const fix = word.slice(0, w.length);
                    if (fix !== w) {
                        break;
                    }
                    const cost = hCost + dc;
                    if (cost <= costLimit) {
                        const suffix = word.slice(w.length);
                        const emit = text + suffix;
                        updateCostLimit(yield { word: emit, cost });
                    }
                }
                continue;
            }
            else {
                historyTags.set(tag, { w: text, i: history.length, m: mxMin });
            }
        }
        /** current depth */
        const d = depth + 1;
        const lastSugLetter = d > 1 ? text[d - 2] : '';
        /** standard cost */
        const c = bc - d + (specialSubCosts[w] || 0);
        /** insert cost */
        const ci = c + (specialInsCosts[w] || 0);
        // Setup first column
        matrix[d] = matrix[d] || [];
        matrix[d][a] = matrix[d - 1][a] + ci + d - a;
        let lastLetter = x[a];
        let min = matrix[d][a];
        let i;
        // calc the core letters
        for (i = a + 1; i <= b; ++i) {
            const curLetter = x[i];
            /** current group */
            const cG = orthography_1.visualLetterMaskMap[curLetter] || 0;
            const subCost = w === curLetter
                ? 0
                : wG & cG
                    ? mapSubCost
                    : curLetter === lastSugLetter
                        ? w === lastLetter
                            ? psc
                            : c
                        : c;
            const e = Math.min(matrix[d - 1][i - 1] + subCost, // substitute
            matrix[d - 1][i] + ci, // insert
            matrix[d][i - 1] + c // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
        }
        // fix the last column
        const { b: bb } = stack[d - 1];
        while (b < mx) {
            b += 1;
            i = b;
            const curLetter = x[i];
            const cG = orthography_1.visualLetterMaskMap[curLetter] || 0;
            const subCost = w === curLetter
                ? 0
                : wG & cG
                    ? mapSubCost
                    : curLetter === lastSugLetter
                        ? w === lastLetter
                            ? psc
                            : c
                        : c;
            // if (i - 1) is out of range, use the last value.
            // no need to be exact, the value will be past maxCost.
            const j = Math.min(bb, i - 1);
            const e = Math.min(matrix[d - 1][j] + subCost, // substitute
            matrix[d][i - 1] + c // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
            if (e > costLimit)
                break;
        }
        // Adjust the range between a and b
        for (; b > a && matrix[d][b] > costLimit; b -= 1) {
            /* empty */
        }
        for (; a < b && matrix[d][a] > costLimit; a += 1) {
            /* empty */
        }
        b = Math.min(b + 1, mx);
        stack[d] = { a, b };
        const cost = matrix[d][b];
        if (node.f && (0, trie_util_1.isWordTerminationNode)(node) && cost <= costLimit) {
            const r = { word: text, cost };
            history.push(r);
            updateCostLimit(yield r);
        }
        else {
            updateCostLimit(yield undefined);
        }
        goDeeper = min <= costLimit;
    }
    return undefined;
}
exports.genCompoundableSuggestions = genCompoundableSuggestions;
//# sourceMappingURL=suggest.js.map