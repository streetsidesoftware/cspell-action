"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opFilter = exports.opFilterSync = exports.opFilterAsync = void 0;
const util_1 = require("../helpers/util");
// prettier-ignore
function opFilterAsync(filterFn) {
    async function* fn(iter) {
        for await (const v of iter) {
            const pass = await filterFn(v);
            if (pass)
                yield v;
        }
    }
    return fn;
}
exports.opFilterAsync = opFilterAsync;
function opFilterSync(filterFn) {
    function* fn(iter) {
        for (const v of iter) {
            if (filterFn(v))
                yield v;
        }
    }
    return fn;
}
exports.opFilterSync = opFilterSync;
function opFilter(fn) {
    const asyncFn = opFilterAsync(fn);
    const syncFn = opFilterSync(fn);
    function _(i) {
        return (0, util_1.isAsyncIterable)(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
exports.opFilter = opFilter;
//# sourceMappingURL=filter.js.map