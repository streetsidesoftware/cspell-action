"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__testing__ = exports.mapDictionaryInformationToWeightMap = void 0;
const weightedMaps_1 = require("../distance/weightedMaps");
const mapDictionaryInfo_1 = require("./mapDictionaryInfo");
const defaultDefs = [
    {
        map: '1234567890-.',
        insDel: 1,
        penalty: 200,
    },
];
const defaultAdjustments = [
    {
        id: 'compound-case-change',
        regexp: /\p{Ll}∙\p{Lu}/gu,
        penalty: 1000,
    },
    {
        id: 'short-compounds-1',
        regexp: /^[^∙]{0,2}(?=∙)|∙[^∙]{0,2}(?=∙|$)/gm,
        penalty: 100,
    },
    {
        id: 'short-compounds-3',
        regexp: /^[^∙]{3}(?=∙)|∙[^∙]{3}(?=∙|$)/gm,
        penalty: 50,
    },
];
function mapDictionaryInformationToWeightMap(dictInfo) {
    const defs = (0, mapDictionaryInfo_1.mapDictionaryInformation)(dictInfo).concat(defaultDefs);
    const adjustments = (0, mapDictionaryInfo_1.mapDictionaryInformationToAdjustment)(dictInfo);
    const map = (0, weightedMaps_1.createWeightMap)(...defs);
    (0, weightedMaps_1.addAdjustment)(map, ...defaultAdjustments, ...adjustments);
    return map;
}
exports.mapDictionaryInformationToWeightMap = mapDictionaryInformationToWeightMap;
exports.__testing__ = {};
//# sourceMappingURL=mapDictionaryInfoToWeightMap.js.map