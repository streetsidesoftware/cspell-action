"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opMap = exports.opMapSync = exports.opMapAsync = void 0;
const util_1 = require("../helpers/util");
function opMapAsync(mapFn) {
    async function* fn(iter) {
        for await (const v of iter) {
            yield mapFn(v);
        }
    }
    return fn;
}
exports.opMapAsync = opMapAsync;
function opMapSync(mapFn) {
    function* fn(iter) {
        for (const v of iter) {
            yield mapFn(v);
        }
    }
    return fn;
}
exports.opMapSync = opMapSync;
const opMap = (fn) => (0, util_1.toPipeFn)(opMapSync(fn), opMapAsync(fn));
exports.opMap = opMap;
//# sourceMappingURL=map.js.map