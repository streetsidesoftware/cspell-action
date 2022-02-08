"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opTap = exports.opTapSync = exports.opTapAsync = void 0;
const util_1 = require("../helpers/util");
/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
function opTapAsync(tapFn) {
    async function* fn(iter) {
        for await (const v of iter) {
            tapFn(v);
            yield v;
        }
    }
    return fn;
}
exports.opTapAsync = opTapAsync;
/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
function opTapSync(tapFn) {
    function* fn(iter) {
        for (const v of iter) {
            tapFn(v);
            yield v;
        }
    }
    return fn;
}
exports.opTapSync = opTapSync;
/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
const opTap = (fn) => (0, util_1.toPipeFn)(opTapSync(fn), opTapAsync(fn));
exports.opTap = opTap;
//# sourceMappingURL=tap.js.map