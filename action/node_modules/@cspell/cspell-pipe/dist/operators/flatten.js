"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opFlatten = exports.opFlattenSync = exports.opFlattenAsync = void 0;
const util_1 = require("../helpers/util");
function opFlattenAsync() {
    async function* fn(iter) {
        for await (const v of iter) {
            yield* v;
        }
    }
    return fn;
}
exports.opFlattenAsync = opFlattenAsync;
function opFlattenSync() {
    function* fn(iter) {
        for (const v of iter) {
            yield* v;
        }
    }
    return fn;
}
exports.opFlattenSync = opFlattenSync;
const opFlatten = () => (0, util_1.toPipeFn)(opFlattenSync(), opFlattenAsync());
exports.opFlatten = opFlatten;
//# sourceMappingURL=flatten.js.map