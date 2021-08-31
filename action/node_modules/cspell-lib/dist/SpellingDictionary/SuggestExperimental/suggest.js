"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestIteration = exports.suggest = void 0;
const helpers_1 = require("./helpers");
const defaultMinScore = 0.35;
const wPrefix = '^';
const wSuffix = '$';
function* suggest(trie, word, minScore = defaultMinScore) {
    yield* suggestIteration(trie.iterate(), word, minScore);
}
exports.suggest = suggest;
function* suggestIteration(i, word, minScore = defaultMinScore) {
    let goDeeper = true;
    const fA = (0, helpers_1.wordToFeatures)(wPrefix + word + wSuffix);
    for (let r = i.next(goDeeper); !r.done; r = i.next(goDeeper)) {
        const { text, node } = r.value;
        const fB = (0, helpers_1.wordToFeatures)(wPrefix + text);
        const rawScore = fA.intersectionScore(fB);
        const bestPossibleScore = fA.count / (fA.count + fB.count - rawScore);
        goDeeper = bestPossibleScore > minScore;
        if (goDeeper && node.f) {
            const fB = (0, helpers_1.wordToFeatures)(wPrefix + text + wSuffix);
            const rawScore = fA.intersectionScore(fB);
            const score = rawScore / (fA.count + fB.count - rawScore);
            if (score >= minScore) {
                const r = { word: text, score };
                minScore = (yield r) || minScore;
            }
        }
    }
}
exports.suggestIteration = suggestIteration;
//# sourceMappingURL=suggest.js.map