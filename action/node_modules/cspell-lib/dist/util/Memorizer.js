"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorizerAll = exports.callOnce = exports.memorizeLastCall = exports.memorizerKeyBy = exports.memorizer = void 0;
const util_1 = require("./util");
/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultSize = 50000;
/**
 * Memorize the result of a function call to be returned on later calls with the same parameters.
 *
 * Note: The parameters are converted into a string: `key = args.join('>!@[')`
 *
 * For speed, it keeps two caches, L0 and L1. Each cache can contain up to `size` values. But that actual number
 * of cached values is between `size + 1` and `size * 2`.
 *
 * Caches are NOT sorted. Items are added to L0 until it is full. Once it is full, L1 takes over L0's values and L0 is cleared.
 *
 * If an item is not found in L0, L1 is checked before calling the `fn` and the resulting value store in L0.
 *
 * @param fn - function to be called.
 * @param size - size of cache
 */
function memorizer(fn, size) {
    return memorizerKeyBy(fn, (...args) => args.join('>!@['), size);
}
exports.memorizer = memorizer;
/**
 * Memorize the result of a function call to be returned on later calls with the same parameters.
 *
 * Note: `keyFn` is use to convert the function parameters into a string to look up in the cache.
 *
 * For speed, it keeps two caches, L0 and L1. Each cache can contain up to `size` values. But that actual number
 * of cached values is between `size + 1` and `size * 2`.
 *
 * Caches are NOT sorted. Items are added to L0 until it is full. Once it is full, L1 takes over L0's values and L0 is cleared.
 *
 * If an item is not found in L0, L1 is checked before calling the `fn` and the resulting value store in L0.
 *
 * @param fn - function to be memorized
 * @param keyFn - extracts a `key` value from the arguments to `fn` to be used as the key to the cache
 * @param size - size of the cache.
 * @returns A function
 */
function memorizerKeyBy(fn, keyFn, size = defaultSize) {
    let count = 0;
    let cacheL0 = Object.create(null);
    let cacheL1 = Object.create(null);
    return (...args) => {
        const key = keyFn(...args);
        if (key in cacheL0)
            return cacheL0[key];
        const v = key in cacheL1 ? cacheL1[key] : fn(...args);
        if (count >= size) {
            cacheL1 = cacheL0;
            cacheL0 = Object.create(null);
            count = 0;
        }
        cacheL0[key] = v;
        ++count;
        return v;
    };
}
exports.memorizerKeyBy = memorizerKeyBy;
function memorizeLastCall(fn) {
    let last;
    return (...p) => {
        if (last && (0, util_1.isArrayEqual)(last.args, p)) {
            return last.value;
        }
        const args = p;
        const value = fn(...args);
        last = { args, value };
        return value;
    };
}
exports.memorizeLastCall = memorizeLastCall;
/**
 * calls a function exactly once and always returns the same value.
 * @param fn - function to call
 * @returns a new function
 */
function callOnce(fn) {
    let last;
    return () => {
        if (last) {
            return last.value;
        }
        last = {
            value: fn(),
        };
        return last.value;
    };
}
exports.callOnce = callOnce;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function memorizerAll(fn) {
    const r = {};
    function find(p) {
        var _a;
        let n = r;
        for (const k of p) {
            if (!n)
                break;
            n = (_a = n.c) === null || _a === void 0 ? void 0 : _a.get(k);
        }
        return n;
    }
    function set(p, v) {
        var _a;
        let n = r;
        for (const k of p) {
            const c = (_a = n.c) === null || _a === void 0 ? void 0 : _a.get(k);
            if (c) {
                n = c;
                continue;
            }
            const r = {};
            n.c = n.c || new Map();
            n.c.set(k, r);
            n = r;
        }
        n.v = v;
    }
    return (...p) => {
        const f = find(p);
        if (f && 'v' in f) {
            return f.v;
        }
        const v = fn(...p);
        set(p, v);
        return v;
    };
}
exports.memorizerAll = memorizerAll;
//# sourceMappingURL=Memorizer.js.map