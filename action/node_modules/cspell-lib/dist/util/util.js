"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSetsIntersect = exports.isArrayEqual = exports.asyncIterableToArray = exports.flatten = exports.flattenIterable = exports.isDefined = exports.scanMap = exports.clean = exports.unique = exports.uniqueFilterFnGenerator = exports.uniqueFn = void 0;
// alias for uniqueFilterFnGenerator
exports.uniqueFn = uniqueFilterFnGenerator;
function uniqueFilterFnGenerator(extractFn) {
    const values = new Set();
    const extractor = extractFn || ((a) => a);
    return (v) => {
        const vv = extractor(v);
        const ret = !values.has(vv);
        values.add(vv);
        return ret;
    };
}
exports.uniqueFilterFnGenerator = uniqueFilterFnGenerator;
function unique(src) {
    return [...new Set(src)];
}
exports.unique = unique;
/**
 * Delete all `undefined` fields from an object.
 * @param src - object to be cleaned
 */
function clean(src) {
    const r = src;
    for (const key of Object.keys(r)) {
        if (r[key] === undefined) {
            delete r[key];
        }
    }
    return r;
}
exports.clean = clean;
function scanMap(accFn, init) {
    let acc = init;
    let first = true;
    return function (value) {
        if (first && acc === undefined) {
            first = false;
            acc = value;
            return acc;
        }
        acc = accFn(acc, value);
        return acc;
    };
}
exports.scanMap = scanMap;
function isDefined(v) {
    return v !== undefined;
}
exports.isDefined = isDefined;
function* flattenIterable(values) {
    for (const v of values) {
        yield* v;
    }
}
exports.flattenIterable = flattenIterable;
function flatten(values) {
    return [...flattenIterable(values)];
}
exports.flatten = flatten;
async function asyncIterableToArray(iter) {
    const acc = [];
    for await (const t of iter) {
        acc.push(t);
    }
    return acc;
}
exports.asyncIterableToArray = asyncIterableToArray;
/**
 * Shallow is Equal test.
 * @param a - array of values
 * @param b - array of values
 * @returns true if the values of `a` are exactly equal to the values of `b`
 */
function isArrayEqual(a, b) {
    if (a === b)
        return true;
    let isMatch = a.length === b.length;
    for (let i = 0; i < a.length && isMatch; ++i) {
        isMatch = a[i] === b[i];
    }
    return isMatch;
}
exports.isArrayEqual = isArrayEqual;
/**
 * Determine if two sets intersect
 * @param a - first Set
 * @param b - second Set
 * @returns true iff any element of `a` is in `b`
 */
function doSetsIntersect(a, b) {
    function compare(a, b) {
        for (const item of a) {
            if (b.has(item))
                return true;
        }
        return false;
    }
    return a.size <= b.size ? compare(a, b) : compare(b, a);
}
exports.doSetsIntersect = doSetsIntersect;
//# sourceMappingURL=util.js.map