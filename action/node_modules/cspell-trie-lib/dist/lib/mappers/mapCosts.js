"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEditCosts = exports.mapHunspellCosts = void 0;
const util_1 = require("../utils/util");
const defaultEditCosts = {
    accentCosts: 1,
    baseCost: 100,
    capsCosts: 1,
    firstLetterPenalty: 4,
    nonAlphabetCosts: 110,
};
const defaultHunspellCosts = {
    ...defaultEditCosts,
    ioConvertCost: 30,
    keyboardCost: 99,
    mapCost: 25,
    replaceCosts: 75,
    tryCharCost: 100,
};
function mapHunspellCosts(costs = {}) {
    return { ...defaultHunspellCosts, ...(0, util_1.cleanCopy)(costs) };
}
exports.mapHunspellCosts = mapHunspellCosts;
function mapEditCosts(costs = {}) {
    return { ...defaultEditCosts, ...(0, util_1.cleanCopy)(costs) };
}
exports.mapEditCosts = mapEditCosts;
//# sourceMappingURL=mapCosts.js.map