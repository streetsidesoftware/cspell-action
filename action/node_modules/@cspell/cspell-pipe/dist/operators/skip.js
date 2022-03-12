"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opSkip = exports.opSkipSync = exports.opSkipAsync = void 0;
const util_1 = require("../helpers/util");
function opSkipAsync(count) {
    async function* fn(iter) {
        for await (const v of iter) {
            if (count > 0) {
                --count;
                continue;
            }
            yield v;
        }
    }
    return fn;
}
exports.opSkipAsync = opSkipAsync;
function opSkipSync(count) {
    function* fn(iter) {
        for (const v of iter) {
            if (count > 0) {
                --count;
                continue;
            }
            yield v;
        }
    }
    return fn;
}
exports.opSkipSync = opSkipSync;
const opSkip = (count) => (0, util_1.toPipeFn)(opSkipSync(count), opSkipAsync(count));
exports.opSkip = opSkip;
//# sourceMappingURL=skip.js.map