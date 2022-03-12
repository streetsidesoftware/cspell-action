"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opConcatMap = exports.opConcatMapSync = exports.opConcatMapAsync = void 0;
const util_1 = require("../helpers/util");
function opConcatMapAsync(mapFn) {
    async function* fn(iter) {
        for await (const v of iter) {
            yield* mapFn(v);
        }
    }
    return fn;
}
exports.opConcatMapAsync = opConcatMapAsync;
function opConcatMapSync(mapFn) {
    function* fn(iter) {
        for (const v of iter) {
            yield* mapFn(v);
        }
    }
    return fn;
}
exports.opConcatMapSync = opConcatMapSync;
const opConcatMap = (fn) => (0, util_1.toPipeFn)(opConcatMapSync(fn), opConcatMapAsync(fn));
exports.opConcatMap = opConcatMap;
//# sourceMappingURL=concatMap.js.map