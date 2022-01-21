"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedWeightedMap = exports.createWeightedMap = exports.editDistanceWeighted = exports.editDistance = void 0;
const distanceAStarWeighted_1 = require("./distanceAStarWeighted");
const levenshtein_1 = require("./levenshtein");
const weightedMaps_1 = require("./weightedMaps");
const defaultCost = 100;
/**
 * Calculate the edit distance between any two words.
 * Use the Damerau–Levenshtein distance algorithm.
 * @param wordA
 * @param wordB
 * @param editCost - the cost of each edit (defaults to 100)
 * @returns the edit distance.
 */
function editDistance(wordA, wordB, editCost = defaultCost) {
    return (0, levenshtein_1.levenshteinDistance)(wordA, wordB) * editCost;
}
exports.editDistance = editDistance;
/**
 * Calculate the weighted edit distance between any two words.
 * @param wordA
 * @param wordB
 * @param weights - the weights to use
 * @param editCost - the cost of each edit (defaults to 100)
 * @returns the edit distance
 */
function editDistanceWeighted(wordA, wordB, weights, editCost = defaultCost) {
    return (0, distanceAStarWeighted_1.distanceAStarWeighted)(wordA, wordB, weights, editCost);
}
exports.editDistanceWeighted = editDistanceWeighted;
/**
 * Collect Map definitions into a single weighted map.
 * @param defs - list of definitions
 * @returns A Weighted Map to be used with distance calculations.
 */
function createWeightedMap(defs) {
    return (0, weightedMaps_1.createWeightMap)(...defs);
}
exports.createWeightedMap = createWeightedMap;
/**
 * Update a WeightedMap with a WeightedMapDef
 * @param weightedMap - map to update
 * @param def - the definition to use
 */
function updatedWeightedMap(weightedMap, def) {
    (0, weightedMaps_1.addDefToWeightMap)(weightedMap, def);
}
exports.updatedWeightedMap = updatedWeightedMap;
//# sourceMappingURL=distance.js.map